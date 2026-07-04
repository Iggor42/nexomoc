# NexoMoc — PRD

## Problema Original
Construir o "NexoMoc", um marketplace de serviços locais para Montes Claros, MG. Tema: "Conectando quem precisa a quem faz."

## Personas
- **Cliente / Contratante**: Precisa de um serviço. Posta uma demanda rápida, SEM login. Fluxo simples.
- **Freelancer / Prestador**: Cadastra-se via Google (Emergent Google Auth), cria perfil/portfólio e divulga serviços.

## Requisitos Centrais (estáticos)
- Clientes postam demandas sem login (formulário simples e rápido).
- Freelancers autenticam via Google Social Login (Emergent Managed Auth).
- Freelancer cria perfil, portfólio e lista de serviços.
- Contato direto por WhatsApp e e-mail.
- Sem integrações de IA — marketplace tradicional.
- Design: tema escuro (Preto #191919, Verde #465242, Bege #E0DCD1), fonte Manrope, uppercase com letter-spacing.

## Arquitetura
- Backend: FastAPI + MongoDB, rotas com prefixo `/api`.
- Frontend: React + Tailwind + Shadcn UI.
- Auth: Emergent Google Auth (cookie `session_token`).

## Endpoints Principais
- `GET /api/` — status
- `GET /api/auth/session` — troca session_id por sessão
- `GET/PUT /api/auth/me` — perfil freelancer logado
- `POST/DELETE /api/auth/services` — serviços do freelancer
- `POST/DELETE /api/auth/portfolio` — portfólio
- `POST /api/auth/logout`
- `GET /api/freelancers` — lista (filtro category/search)
- `GET /api/freelancers/{user_id}` — detalhe
- `POST /api/demands` — cria demanda de cliente (sem login)
- `GET /api/demands` — lista demandas (filtro category)

## Schema DB
- **freelancers/users**: {user_id, email, name, picture, phone, bio, category, services[], portfolio[], created_at}
- **demands**: {demand_id, client_name, client_phone, client_email, title, category, description, budget, status, created_at}
- **sessions**: {session_token, user_id, expires_at}

## Implementado (2026-07)
- Emergent Google Auth (login/callback/sessão) ✅
- CRUD de demandas de clientes (sem login) ✅
- CRUD de perfil/serviços/portfólio de freelancer ✅
- Listagem e filtro de freelancers ✅
- Landing page (Home) com tema escuro da marca ✅
- Dashboard freelancer, board de vagas/demandas, perfil público ✅
- Contato direto via WhatsApp e e-mail ✅
- Testado E2E e API (100% sucesso) ✅

## Backlog Priorizado
- **P1**: Paginação, busca e filtros avançados nos boards de demandas e freelancers.
- **P2**: Upload de imagens (foto de perfil e portfólio) via Object Storage.
- **P2**: Categorias/tags refinadas e página de categoria dedicada.
- **P3**: Avaliações/reviews de freelancers.

## Próximas Tarefas
1. Confirmar com usuário próximas prioridades (P1 busca/filtros ou P2 upload de imagens).
2. Implementar Object Storage para imagens quando solicitado.
