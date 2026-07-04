# Guia de Deploy — NexoMoc (Netlify + Railway/Render + MongoDB Atlas)

Este guia leva o NexoMoc para produção fora da plataforma Emergent, usando:
- **Frontend (React)** → Netlify
- **Backend (FastAPI)** → Railway ou Render
- **Banco (MongoDB)** → MongoDB Atlas (free tier)
- **Auth** → Emergent Managed Google Auth (funciona em qualquer domínio, sem whitelist)

---

## 1. Pré-requisitos

- Conta no [GitHub](https://github.com) (já usada para o "Save to GitHub" do Emergent)
- Conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Conta gratuita no [Netlify](https://app.netlify.com/signup)
- Conta em [Railway](https://railway.app) **ou** [Render](https://render.com)

---

## 2. MongoDB Atlas (banco em produção)

1. Crie um projeto e um cluster **M0 (Free)** no Atlas.
2. **Database Access** → crie um usuário (ex.: `nexomoc_admin`) e uma senha forte.
3. **Network Access** → adicione `0.0.0.0/0` (allow from anywhere) para que Railway/Render possa se conectar.
4. **Connect → Drivers** → copie a connection string. Formato:
   ```
   mongodb+srv://nexomoc_admin:<PASSWORD>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Substitua `<PASSWORD>` pela senha real. Guarde essa string — vai virar `MONGO_URL`.

---

## 3. Deploy do Backend (Railway — recomendado)

### 3.1 Configuração no Railway

1. Acesse [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Selecione o repositório do NexoMoc.
3. Em **Settings → Service**:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Em **Variables**, adicione:
   | Variável        | Valor                                                            |
   |-----------------|------------------------------------------------------------------|
   | `MONGO_URL`     | (a string do Atlas)                                              |
   | `DB_NAME`       | `nexomoc_prod`                                                   |
   | `CORS_ORIGINS`  | `https://SEU-SITE.netlify.app` (você preenche depois do passo 4) |
5. Em **Settings → Networking**, clique em **Generate Domain**. Anote a URL pública (ex.: `https://nexomoc-backend.up.railway.app`).
6. Aguarde o build/deploy. Teste: abra `https://SEU-BACKEND.up.railway.app/api/` — deve retornar `{"status": "online", ...}`.

### 3.2 Alternativa: Render

1. [render.com](https://render.com) → **New → Web Service** → conecte o GitHub.
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. **Environment**: adicione as mesmas variáveis do Railway (`MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`).
6. Anote a URL (ex.: `https://nexomoc-backend.onrender.com`).

> ⚠️ No plano gratuito do Render, o serviço **dorme após 15 min de inatividade** (primeira request pós-sleep leva ~30s). Railway não tem esse problema no free trial.

---

## 4. Deploy do Frontend (Netlify)

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git** → GitHub → selecione o repo.
2. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `yarn build`
   - **Publish directory**: `frontend/build`
3. Em **Site settings → Environment variables**, adicione:
   | Variável                  | Valor                                                    |
   |---------------------------|----------------------------------------------------------|
   | `REACT_APP_BACKEND_URL`   | `https://SEU-BACKEND.up.railway.app` (do passo 3)        |
   | `CI`                      | `false` (evita que warnings quebrem o build)             |
4. Clique em **Deploy site**. Ao terminar, você terá algo como `https://nexomoc.netlify.app`.
5. **Volte no Railway/Render** e atualize `CORS_ORIGINS` com essa URL do Netlify. Faça um redeploy do backend.

### 4.1 SPA redirects (importante!)

O arquivo `netlify.toml` já está incluído na raiz do repositório e cuida das rotas do React Router (evita 404 em `/dashboard`, `/vagas`, etc.).

---

## 5. Domínio próprio (opcional)

- No **Netlify**: **Domain settings → Add custom domain** → siga instruções DNS.
- Depois de configurar o domínio (ex.: `nexomoc.com.br`), atualize novamente o `CORS_ORIGINS` no backend:
  ```
  CORS_ORIGINS=https://nexomoc.com.br,https://www.nexomoc.com.br
  ```

---

## 6. Checklist de verificação pós-deploy

- [ ] `https://SEU-BACKEND/api/` retorna JSON com `"status": "online"`
- [ ] `https://SEU-SITE.netlify.app` carrega a home
- [ ] Home mostra a lista de freelancers (vem do backend)
- [ ] Cadastro via **Login com Google** redireciona corretamente e cria a sessão
- [ ] Página `/vagas` lista as demandas
- [ ] Publicar demanda como cliente funciona
- [ ] Console do navegador sem erros de CORS

---

## 7. Troubleshooting

**❌ CORS error no browser**
- Verifique se `CORS_ORIGINS` no Railway/Render contém o domínio **exato** do Netlify (com `https://`, sem `/` no final).
- Múltiplos domínios: separe por vírgula sem espaços.

**❌ Login com Google não cria sessão**
- Verifique se o backend consegue chamar `https://demobackend.emergentagent.com` (sem firewall bloqueando).
- Confirme que o cookie `session_token` está sendo setado (DevTools → Application → Cookies).
- O cookie exige `SameSite=None; Secure` → o frontend e o backend **precisam** estar em HTTPS.

**❌ 500 no backend logo após deploy**
- Confira os logs do Railway/Render. Provável causa: `MONGO_URL` errada ou senha não escapada (caracteres especiais como `@`, `#` precisam ser URL-encoded).

**❌ Build do frontend falha**
- Confirme `Base directory = frontend` e `Publish directory = frontend/build`.
- Se aparecer "Treating warnings as errors": confirme que `CI=false` foi adicionado nas env vars.

**❌ Home mostra "carregando..." infinito**
- `REACT_APP_BACKEND_URL` está correto? Deve ser a URL do Railway/Render, sem `/api` no final.
- Faça hard refresh (Ctrl+Shift+R) — o Netlify pode ter cacheado build anterior.

---

## 8. Custos estimados (free tier)

| Serviço          | Free tier                                              |
|------------------|--------------------------------------------------------|
| Netlify          | 100GB banda/mês, builds ilimitados                     |
| Railway          | US$5 crédito grátis; ~500h/mês de serviço leve         |
| Render           | 750h/mês (com sleep após 15min inativo)                |
| MongoDB Atlas M0 | 512MB storage, conexões ilimitadas — para sempre grátis|

Para o NexoMoc MVP com tráfego moderado (~1000 visitas/mês), tudo cabe no free tier.
