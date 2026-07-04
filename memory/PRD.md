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

## Deployment Readiness (2026-02)
- Guia completo `/app/DEPLOYMENT.md` (Netlify + Railway/Render + MongoDB Atlas) ✅
- `netlify.toml` com SPA redirects e cache/security headers ✅
- `backend/Procfile` + `backend/runtime.txt` (Python 3.11.9) para Railway/Render ✅
- `render.yaml` blueprint pronto ✅
- `.env.example` para frontend e backend ✅
- Código já 100% env-driven (MONGO_URL, DB_NAME, CORS_ORIGINS, REACT_APP_BACKEND_URL) ✅
- Emergent Google Auth confirmado como portável (usa window.location.origin, sem whitelist de domínio) ✅

## SEO Básico (2026-02)
- `index.html`: `lang="pt-BR"`, title/description otimizados para "Montes Claros", geo tags, canonical, Open Graph completo, Twitter Card, JSON-LD LocalBusiness (schema.org) ✅
- `robots.txt`: permite indexação, protege `/dashboard` e `/auth/`, aponta para sitemap ✅
- `sitemap.xml`: home, /vagas e URLs de categoria ✅
- Componente `SEO.js` reutilizável usando metadata nativa do React 19 (sem lib extra) ✅
- Meta tags dinâmicas por rota: Home (WebSite JSON-LD), VagasBoard (CollectionPage), FreelancerProfile (Person + AggregateRating), Dashboard ✅
- Validado via Playwright: title/description/OG/Twitter/JSON-LD/canonical injetados corretamente em produção ✅
- Instruções de pós-deploy no DEPLOYMENT.md: substituir domínio placeholder, criar og-image.png, Google Search Console ✅

## Landing Pages de Categoria (2026-02)
- 8 landing pages SEO-friendly com URL amigável, cada uma com config em `frontend/src/data/categories.js`:
  - `/eletricistas-em-montes-claros`
  - `/designers-em-montes-claros`
  - `/fotografos-em-montes-claros`
  - `/reformas-em-montes-claros`
  - `/marketing-montes-claros`
  - `/beleza-montes-claros`
  - `/servicos-domesticos-montes-claros`
  - `/ti-tecnologia-montes-claros`
- Componente único `CategoryPage.js` alimentado por config (título único, meta description única, JSON-LD CollectionPage + Service com OfferCatalog + BreadcrumbList, filtro de freelancers por categoria backend + termo de busca)
- Rotas registradas dinamicamente em `App.js` via `CATEGORY_SLUGS.map(...)`
- Home: cards de categoria em destaque linkam para landing pages dedicadas quando aplicável
- Home: nova seção "Buscas populares" com 8 pill-links para todas as landing pages (internal linking SEO)
- Cross-linking: cada CategoryPage lista as outras 7 no rodapé
- Sitemap.xml atualizado com todas as 8 URLs (priority 0.85, changefreq weekly)
- Validado via Playwright em todas as 8 rotas: title, canonical, og:url e h1 únicos por slug ✅

## Backlog Priorizado
- **P1**: Paginação, busca e filtros avançados nos boards de demandas e freelancers.
- **P2**: Upload de imagens (foto de perfil e portfólio) via Object Storage.
- **P2**: Categorias/tags refinadas e página de categoria dedicada.
- **P3**: Avaliações/reviews de freelancers.

## Próximas Tarefas
1. Confirmar com usuário próximas prioridades (P1 busca/filtros ou P2 upload de imagens).
2. Implementar Object Storage para imagens quando solicitado.
