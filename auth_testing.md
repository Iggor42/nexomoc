# Playbook de Teste de Autenticação - NexoMoc

Este arquivo contém instruções e scripts para criar uma sessão de teste direto no banco de dados MongoDB para validar as rotas autenticadas do painel do prestador (freelancer).

## Passo 1: Criar Usuário e Sessão de Teste no MongoDB
Execute o seguinte comando no terminal para gerar as credenciais de teste válidas:

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-moc-123';
var sessionToken = 'test_session_token_moc_abc';
db.users.deleteOne({ user_id: userId });
db.user_sessions.deleteOne({ user_id: userId });
db.users.insertOne({
  user_id: userId,
  email: 'test.freelancer@nexomoc.com.br',
  name: 'Pedro Silva de Montes Claros',
  picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  phone: '+5538999998888',
  bio: 'Eletricista de alta performance atuando na região central de Montes Claros.',
  categories: ['Construção e Reformas'],
  services: [
    {id: 'srv-test-1', title: 'Manutenção Elétrica Completa', description: 'Revisão de fiação residencial e comercial.', price: 'R$ 350'}
  ],
  portfolio: [
    {id: 'port-test-1', title: 'Reforma de Padrão CEMIG', description: 'Instalação de padrão bifásico aprovada pela CEMIG.', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'}
  ],
  rating: 5.0,
  review_count: 3,
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Usuário de teste criado com sucesso!');
print('Session Token: ' + sessionToken);
"
```

## Passo 2: Validar API Backend
Valide a sessão criada usando um simples comando curl:
```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s -X GET \"\$API_URL/api/auth/me\" -H \"Authorization: Bearer test_session_token_moc_abc\"
```

## Passo 3: Inserir Cookie no Navegador para Teste End-to-End
No Playwright ou no console de desenvolvimento do navegador, adicione o seguinte cookie antes de navegar para `/dashboard`:
```javascript
await page.context.add_cookies([{
    "name": "session_token",
    "value": "test_session_token_moc_abc",
    "domain": "localhost", // ou o domínio da preview
    "path": "/",
    "httpOnly": true,
    "secure": true,
    "sameSite": "None"
}]);
await page.goto(window.location.origin + "/dashboard");
```

## Identidade de Teste Registrada
As credenciais de teste para o agente de testes e ferramentas automatizadas são:
- **E-mail**: `test.freelancer@nexomoc.com.br`
- **Nome**: `Pedro Silva de Montes Claros`
- **Token de Sessão**: `test_session_token_moc_abc`
- **ID de Usuário**: `test-user-moc-123`
