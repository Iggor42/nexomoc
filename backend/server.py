from fastapi import FastAPI, APIRouter, Cookie, Header, Depends, HTTPException, Response, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import requests
import smtplib
import threading
import urllib.request
import json as json_lib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --- EMAIL NOTIFICATION ---
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRTppsDH3Km6-jXM_-YRVivOXuWMM70khlDHV-BSoNnMACyF42oP8giEAjc_AlUFk2Ag/exec"

def _send_email_worker(subject: str, body: str):
    try:
        payload = json_lib.dumps({
            "subject": subject,
            "body": body
        }).encode("utf-8")

        req = urllib.request.Request(
            APPS_SCRIPT_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        # Apps Script redireciona — seguir redirect manualmente
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
        with opener.open(req, timeout=20) as resp:
            result = resp.read().decode()
            logger.info(f"E-mail enviado via Apps Script: {subject} — {result}")
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail: {e}")

def send_email_notification(subject: str, body: str):
    t = threading.Thread(target=_send_email_worker, args=(subject, body), daemon=True)
    t.start()

# Create FastAPI instance
app = FastAPI(title="NexoMoc API")

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# --- PYDANTIC SCHEMAS ---

class ServiceItem(BaseModel):
    id: str = Field(default_factory=lambda: f"srv_{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    price: str

class PortfolioItem(BaseModel):
    id: str = Field(default_factory=lambda: f"port_{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    image_url: str

class FreelancerProfileUpdate(BaseModel):
    name: str
    phone: str
    bio: str
    categories: List[str]

class ClientDemandCreate(BaseModel):
    client_name: str
    client_phone: str
    client_email: str
    title: str
    category: str
    description: str
    budget: str

class ClientDemandResponse(BaseModel):
    demand_id: str
    client_name: str
    client_phone: str
    client_email: str
    title: str
    category: str
    description: str
    budget: str
    status: str
    created_at: str

# --- AUTH DEVIATION PROTECTION ---
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

async def get_current_user(
    session_token_cookie: Optional[str] = Cookie(None, alias="session_token"),
    authorization: Optional[str] = Header(None)
):
    session_token = None
    if session_token_cookie:
        session_token = session_token_cookie
    elif authorization and authorization.startswith("Bearer "):
        session_token = authorization.split(" ")[1]

    if not session_token:
        logger.info("No session token found in cookies or authorization header")
        raise HTTPException(status_code=401, detail="Não autenticado. Faça login para continuar.")

    # Find the session in MongoDB
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        logger.info(f"No active session found for token: {session_token}")
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")

    # Validate expiry
    expires_at_str = session_doc.get("expires_at")
    if not expires_at_str:
        raise HTTPException(status_code=401, detail="Sessão inválida.")

    expires_at = datetime.fromisoformat(expires_at_str)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        logger.info("Session token expired")
        raise HTTPException(status_code=401, detail="Sessão expirada.")

    # Retrieve User data (ALWAYS exclude _id to prevent serialization issues)
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        logger.info(f"Session exists but user_id {session_doc['user_id']} not found in users")
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")

    return user_doc


# --- ENDPOINTS ---

@api_router.get("/")
async def root():
    return {
        "status": "online",
        "message": "NexoMoc API — Conectando quem precisa a quem faz em Montes Claros, MG.",
        "version": "1.0.0"
    }

@api_router.get("/test-email")
async def test_email():
    """Endpoint de diagnóstico para testar envio de e-mail via Apps Script."""
    try:
        payload = json_lib.dumps({
            "subject": "[NexoMoc] Teste diagnóstico",
            "body": "<h2>Teste direto do Railway via Apps Script</h2>"
        }).encode("utf-8")
        req = urllib.request.Request(
            APPS_SCRIPT_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
        with opener.open(req, timeout=20) as resp:
            result = resp.read().decode()
            return {"status": "enviado", "resposta": result}
    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}

# --- OAUTH AUTH CALLBACK AND SESSION MANAGEMENT ---

@api_router.get("/auth/session")
async def handle_auth_session(session_id: str, response: Response):
    """
    Exchanges session_id with Emergent OAuth provider, creates/finds user,
    saves the session token in db and returns cookie/JSON.
    """
    logger.info(f"Exchanging session_id: {session_id}")
    url = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    headers = {"X-Session-ID": session_id}

    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code != 200:
            logger.error(f"Failed to fetch session from Emergent Auth server. Status: {res.status_code}, Body: {res.text}")
            raise HTTPException(status_code=400, detail="Falha ao sincronizar dados da sessão com o servidor de autenticação.")
        
        data = res.json()
    except Exception as e:
        logger.error(f"Error calling Emergent Auth endpoint: {e}")
        raise HTTPException(status_code=400, detail="Erro de conexão com o provedor de autenticação.")

    email = data.get("email")
    name = data.get("name")
    picture = data.get("picture", "")
    session_token = data.get("session_token")

    if not email or not session_token:
        logger.error(f"Incomplete session data received: {data}")
        raise HTTPException(status_code=400, detail="Dados de sessão incompletos recebidos.")

    # Find or Create User (ALWAYS project out _id)
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update name and profile picture from Google if changed, keep phone, bio, and listings intact
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": name, 
                "picture": picture if picture else user_doc.get("picture", "")
            }}
        )
        user_doc["name"] = name
        if picture:
            user_doc["picture"] = picture
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "phone": "",
            "bio": "Olá! Sou profissional autônomo em Montes Claros e acabo de me cadastrar no NexoMoc.",
            "categories": [],
            "services": [],
            "portfolio": [],
            "rating": 5.0,
            "review_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        user_doc.pop("_id", None) # Safe cleanup

    # Store/Refresh Session Token
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )

    # Set Session Token Cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60 # 7 days
    )

    logger.info(f"Session established successfully for {email}")
    return {
        "user": user_doc,
        "session_token": session_token
    }


@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Returns the authenticated user details."""
    return user


@api_router.put("/auth/me")
async def update_me(profile: FreelancerProfileUpdate, user: dict = Depends(get_current_user)):
    """Updates the authenticated user's core profile."""
    user_id = user["user_id"]
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "name": profile.name,
                "phone": profile.phone,
                "bio": profile.bio,
                "categories": profile.categories
            }
        }
    )
    # Fetch updated and return
    updated_user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return updated_user


@api_router.post("/auth/services")
async def add_service(service: ServiceItem, user: dict = Depends(get_current_user)):
    """Adds a new service offering to the freelancer's profile."""
    user_id = user["user_id"]
    new_service = service.model_dump()
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"services": new_service}}
    )
    return {"status": "success", "service": new_service}


@api_router.delete("/auth/services/{service_id}")
async def delete_service(service_id: str, user: dict = Depends(get_current_user)):
    """Removes a service offering from the freelancer's profile."""
    user_id = user["user_id"]
    await db.users.update_one(
        {"user_id": user_id},
        {"$pull": {"services": {"id": service_id}}}
    )
    return {"status": "success", "message": "Serviço removido com sucesso."}


@api_router.post("/auth/portfolio")
async def add_portfolio_item(portfolio_item: PortfolioItem, user: dict = Depends(get_current_user)):
    """Adds a new item to the freelancer's portfolio."""
    user_id = user["user_id"]
    new_item = portfolio_item.model_dump()
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$push": {"portfolio": new_item}}
    )
    return {"status": "success", "portfolio_item": new_item}


@api_router.delete("/auth/portfolio/{item_id}")
async def delete_portfolio_item(item_id: str, user: dict = Depends(get_current_user)):
    """Removes a portfolio item from the freelancer's profile."""
    user_id = user["user_id"]
    await db.users.update_one(
        {"user_id": user_id},
        {"$pull": {"portfolio": {"id": item_id}}}
    )
    return {"status": "success", "message": "Item do portfólio removido com sucesso."}


@api_router.post("/auth/logout")
async def logout(response: Response, session_token_cookie: Optional[str] = Cookie(None, alias="session_token")):
    """Invalidates session and clears response cookies."""
    if session_token_cookie:
        await db.user_sessions.delete_many({"session_token": session_token_cookie})
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    return {"status": "success", "message": "Logout realizado com sucesso."}


# --- PUBLIC FREELANCER DIRECTORY ENDPOINTS ---

@api_router.get("/freelancers")
async def list_freelancers(category: Optional[str] = None, search: Optional[str] = None):
    """
    Lists freelancers with optional filtering and query searching.
    Only freelancers who have set a WhatsApp phone number are displayed to ensure they are contactable.
    """
    query = {"phone": {"$ne": ""}} # Display only contactable professionals
    
    if category and category != "Todos":
        query["categories"] = {"$in": [category]}
        
    if search:
        # Simple case-insensitive regex match across name, bio, and categories
        regex_search = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"name": regex_search},
            {"bio": regex_search},
            {"categories": {"$elemMatch": regex_search}}
        ]
        
    freelancers = await db.users.find(query, {"_id": 0}).to_list(1000)
    return freelancers


@api_router.get("/freelancers/{user_id}")
async def get_freelancer_by_id(user_id: str):
    """Returns profile detail of a specific freelancer."""
    freelancer = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not freelancer:
        raise HTTPException(status_code=404, detail="Profissional não encontrado.")
    return freelancer


# --- CLIENT DEMANDS ENDPOINTS (NO LOGIN REQUIRED) ---

@api_router.post("/demands", response_model=ClientDemandResponse)
async def create_client_demand(demand_input: ClientDemandCreate):
    """Creates a new project request / job vacancy from a customer."""
    demand_id = f"demand_{uuid.uuid4().hex[:12]}"
    
    demand_doc = {
        "demand_id": demand_id,
        "client_name": demand_input.client_name,
        "client_phone": demand_input.client_phone,
        "client_email": demand_input.client_email,
        "title": demand_input.title,
        "category": demand_input.category,
        "description": demand_input.description,
        "budget": demand_input.budget,
        "status": "aberto",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.demands.insert_one(demand_doc)
    demand_doc.pop("_id", None)
    return ClientDemandResponse(**demand_doc)


@api_router.get("/demands", response_model=List[ClientDemandResponse])
async def list_client_demands(category: Optional[str] = None):
    """Lists all available client demands sorted by newest."""
    query = {}
    if category and category != "Todos":
        query["category"] = category
        
    demands_list = await db.demands.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [ClientDemandResponse(**doc) for doc in demands_list]


# --- SEEDING LOGIC ON APP STARTUP ---

@app.on_event("startup")
async def seed_data():
    """Populates the database with initial Montes Claros freelancers to make the app feel alive."""
    logger.info("Checking database seed state...")
    users_count = await db.users.count_documents({})
    if users_count == 0:
        logger.info("Database is empty. Seeding initial freelancers...")
        sample_freelancers = [
            {
                "user_id": "user_thiago123",
                "email": "thiago.eletricista@gmail.com",
                "name": "Thiago Silva",
                "picture": "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&crop=entropy&q=80",
                "phone": "+5538999991111",
                "bio": "Eletricista residencial e industrial certificado pelo SENAI Montes Claros. Mais de 10 anos de experiência realizando reformas elétricas seguras e instalações de ar condicionado no Major Prates, Ibituruna e região.",
                "categories": ["Construção e Reformas"],
                "services": [
                    {
                        "id": "srv_thiago1",
                        "title": "Reforma Elétrica Residencial Completa",
                        "description": "Troca de fiação antiga, organização e balanceamento de cargas no quadro de disjuntores para prevenir curtos.",
                        "price": "A partir de R$ 400"
                    },
                    {
                        "id": "srv_thiago2",
                        "title": "Instalação de Chuveiro e Iluminação",
                        "description": "Substituição rápida de resistências, chuveiros elétricos, instalação de spots, luminárias e fita LED.",
                        "price": "R$ 80"
                    }
                ],
                "portfolio": [
                    {
                        "id": "port_thiago1",
                        "title": "Quadro de Distribuição Organizado",
                        "description": "Reestruturação completa de fiação e instalação de novos disjuntores DIN modernos em condomínio fechado.",
                        "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80"
                    }
                ],
                "rating": 4.9,
                "review_count": 14,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "user_id": "user_mariana456",
                "email": "mari.webdesign@gmail.com",
                "name": "Mariana Santos",
                "picture": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&crop=entropy&q=80",
                "phone": "+5538999992222",
                "bio": "Designer UX/UI e Desenvolvedora de Sites. Crio páginas de vendas modernas (Landing Pages) integradas ao WhatsApp para ajudar empresas e clínicas de Montes Claros a venderem muito mais todos os dias.",
                "categories": ["Design e Tecnologia"],
                "services": [
                    {
                        "id": "srv_mari1",
                        "title": "Desenvolvimento de Landing Page Local",
                        "description": "Página única de alta conversão, design otimizado para celulares, velocidade máxima e integração direta de botões com o WhatsApp.",
                        "price": "R$ 950"
                    }
                ],
                "portfolio": [
                    {
                        "id": "port_mari1",
                        "title": "Plataforma Odontológica MOC",
                        "description": "UI/UX e frontend elegante desenvolvido para agendamento online e captação de pacientes no centro de Montes Claros.",
                        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80"
                    }
                ],
                "rating": 5.0,
                "review_count": 8,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "user_id": "user_anaclara78",
                "email": "anaclara.nails@gmail.com",
                "name": "Ana Clara Rocha",
                "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&crop=entropy&q=80",
                "phone": "+5538999993333",
                "bio": "Nail Designer especialista em alongamento em gel e blindagem de unhas naturais. Ofereço atendimento exclusivo e materiais 100% esterilizados no Centro de Montes Claros.",
                "categories": ["Beleza e Bem-Estar"],
                "services": [
                    {
                        "id": "srv_ana1",
                        "title": "Alongamento de Unhas em Gel",
                        "description": "Extensão duradoura com acabamento ultrafino e natural, usando as melhores marcas do mercado internacional.",
                        "price": "R$ 130"
                    },
                    {
                        "id": "srv_ana2",
                        "title": "Manicure e Pedicure Simples",
                        "description": "Cutilagem impecável e esmaltação perfeita com alta durabilidade das cores tradicionais.",
                        "price": "R$ 50"
                    }
                ],
                "portfolio": [
                    {
                        "id": "port_ana1",
                        "title": "Almond Decorada com Folha de Ouro",
                        "description": "Alongamento impecável com nail art delicada feita sob medida para noivas.",
                        "image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80"
                    }
                ],
                "rating": 4.8,
                "review_count": 22,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "user_id": "user_carlos999",
                "email": "carlos.english@gmail.com",
                "name": "Prof. Carlos Eduardo",
                "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&crop=entropy&q=80",
                "phone": "+5538999994444",
                "bio": "Professor de inglês e tradutor profissional. Aulas de conversação personalizadas e voltadas para viagens, entrevistas de emprego ou aceleração de carreira corporativa. Atendimento presencial ou online.",
                "categories": ["Educação"],
                "services": [
                    {
                        "id": "srv_carlos1",
                        "title": "Mensalidade Inglês Particular",
                        "description": "Curso individual com 2 aulas semanais ao vivo de 1h cada. Material didático digital de alta qualidade incluso.",
                        "price": "R$ 350 / mês"
                    }
                ],
                "portfolio": [],
                "rating": 5.0,
                "review_count": 12,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "user_id": "user_claudia777",
                "email": "claudia.cozinha@gmail.com",
                "name": "Cláudia Ferreira (Cacau)",
                "picture": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&crop=entropy&q=80",
                "phone": "+5538999995555",
                "bio": "Cozinheira profissional de comida típica mineira e preparo de congelados saudáveis para a semana inteira. Organização completa da cozinha residencial e cardápio balanceado.",
                "categories": ["Serviços Domésticos"],
                "services": [
                    {
                        "id": "srv_claudia1",
                        "title": "Preparo de Marmitas Congeladas Semanais",
                        "description": "Vou à sua casa e cozinho 10 refeições variadas e saudáveis que duram a semana inteira no freezer (ingredientes por conta do cliente).",
                        "price": "R$ 250"
                    }
                ],
                "portfolio": [],
                "rating": 4.9,
                "review_count": 31,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.users.insert_many(sample_freelancers)
        logger.info("Successfully seeded database users.")

    demands_count = await db.demands.count_documents({})
    if demands_count == 0:
        logger.info("Seeding sample demands...")
        sample_demands = [
            {
                "demand_id": "demand_seed1",
                "client_name": "Juliana Pinheiro",
                "client_phone": "+5538988887777",
                "client_email": "juliana@gmail.com",
                "title": "Preciso de um Pintor para Sala Comercial",
                "category": "Construção e Reformas",
                "description": "Preciso pintar uma sala comercial de aproximadamente 40m² no Centro de Montes Claros. Já possuo as tintas (Suvinil fosco off-white), necessito apenas da mão de obra para reparo de pequenas trincas e aplicação de duas demãos.",
                "budget": "R$ 400 - R$ 600",
                "status": "aberto",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "demand_id": "demand_seed2",
                "client_name": "Arthur Mendes",
                "client_phone": "+5538988886666",
                "client_email": "arthur.mendes@hotmail.com",
                "title": "Aulas de Reforço de Matemática para o Ensino Médio",
                "category": "Educação",
                "description": "Procuro um professor de matemática para dar aulas de reforço presencial para meu filho que está no 2º ano do Ensino Médio. Seriam duas horas de aula por semana no bairro Ibituruna, focado em funções matemáticas.",
                "budget": "R$ 50 - R$ 70 / hora",
                "status": "aberto",
                "created_at": (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
            }
        ]
        await db.demands.insert_many(sample_demands)
        logger.info("Successfully seeded database demands.")


# --- NOVOS ENDPOINTS: FORMULÁRIOS DE CADASTRO ---

class FreelancerRegistration(BaseModel):
    full_name: str
    professional_name: str
    category: str
    service_description: str
    city_neighborhood: str
    remote: str
    whatsapp: str
    instagram: Optional[str] = ""
    portfolio_link: Optional[str] = ""

class ClientDemandForm(BaseModel):
    name: str
    company: Optional[str] = ""
    service_type: str
    demand_description: str
    deadline: Optional[str] = ""
    work_format: str
    whatsapp: str
    allow_publish: str

@api_router.post("/freelancer-registration", status_code=201)
async def register_freelancer(data: FreelancerRegistration):
    doc = data.dict()
    doc["registration_id"] = f"reg_{uuid.uuid4().hex[:12]}"
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.freelancer_registrations.insert_one(doc)
    logger.info(f"Nova inscrição de freelancer: {data.professional_name} — {data.category}")

    body = f"""
    <h2 style="color:#465242">Novo Cadastro de Prestador — NexoMoc</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Nome completo</b></td><td style="padding:8px;border:1px solid #ddd">{data.full_name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Nome profissional</b></td><td style="padding:8px;border:1px solid #ddd">{data.professional_name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Categoria</b></td><td style="padding:8px;border:1px solid #ddd">{data.category}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Descrição</b></td><td style="padding:8px;border:1px solid #ddd">{data.service_description}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Cidade/Bairro</b></td><td style="padding:8px;border:1px solid #ddd">{data.city_neighborhood}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Atende remoto</b></td><td style="padding:8px;border:1px solid #ddd">{data.remote}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>WhatsApp</b></td><td style="padding:8px;border:1px solid #ddd">{data.whatsapp}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Instagram</b></td><td style="padding:8px;border:1px solid #ddd">{data.instagram or '—'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Portfólio</b></td><td style="padding:8px;border:1px solid #ddd">{data.portfolio_link or '—'}</td></tr>
    </table>
    """
    send_email_notification(f"[NexoMoc] Novo prestador: {data.professional_name}", body)

    return {"message": "Cadastro recebido com sucesso.", "id": doc["registration_id"]}

@api_router.get("/admin/registrations")
async def list_registrations():
    """Lista todos os cadastros de prestadores recebidos."""
    docs = await db.freelancer_registrations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api_router.get("/admin/demands")
async def list_all_demands():
    """Lista todas as demandas de contratantes recebidas."""
    docs = await db.client_demands.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs

@api_router.post("/client-demand", status_code=201)
async def submit_client_demand(data: ClientDemandForm):
    doc = data.dict()
    doc["demand_id"] = f"dem_{uuid.uuid4().hex[:12]}"
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.client_demands.insert_one(doc)
    logger.info(f"Nova demanda de cliente: {data.name} — {data.service_type}")

    body = f"""
    <h2 style="color:#465242">Nova Demanda de Contratante — NexoMoc</h2>
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Nome</b></td><td style="padding:8px;border:1px solid #ddd">{data.name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Empresa</b></td><td style="padding:8px;border:1px solid #ddd">{data.company or '—'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Tipo de serviço</b></td><td style="padding:8px;border:1px solid #ddd">{data.service_type}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Descrição</b></td><td style="padding:8px;border:1px solid #ddd">{data.demand_description}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Prazo</b></td><td style="padding:8px;border:1px solid #ddd">{data.deadline or '—'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Formato</b></td><td style="padding:8px;border:1px solid #ddd">{data.work_format}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>WhatsApp</b></td><td style="padding:8px;border:1px solid #ddd">{data.whatsapp}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd"><b>Autoriza publicar</b></td><td style="padding:8px;border:1px solid #ddd">{data.allow_publish}</td></tr>
    </table>
    """
    send_email_notification(f"[NexoMoc] Nova demanda: {data.service_type} — {data.name}", body)

    return {"message": "Demanda recebida com sucesso.", "id": doc["demand_id"]}

# Include the API router
app.include_router(api_router)

# Enable CORS for the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port)
