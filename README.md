# Assistec OS

Aplicativo web responsivo para gestão de assistências técnicas (celulares, computadores e notebooks). A base está preparada para SaaS multi-empresa com Firebase Auth + Firestore.

## Funcionalidades principais

- Autenticação com Google e e-mail/senha (mock local pronto para Firebase).
- Rotas protegidas com `react-router-dom`.
- Dashboard, clientes, OS, vendas, financeiro, caixa e configurações.
- UI premium responsiva com sidebar colapsável e bottom navigation.
- Estados de loading/empty/error em listas principais.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## Estrutura

```
index.html
package.json
src/
  App.jsx
  main.jsx
  components/
  hooks/
  pages/
  services/
```

## Firebase

1. Crie um projeto no Firebase Console.
2. Habilite Authentication (Google e Email/Senha).
3. Configure as variáveis de ambiente no `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Veja o guia completo em `docs/firebase.md`.
