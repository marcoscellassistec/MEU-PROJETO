# Firebase - Assistec OS

## 1. Auth

- Ative Google + Email/Senha.
- Crie um usuário admin inicial.

## 2. Firestore (multi-tenant)

Coleções sugeridas por empresa:

```
companies/{companyId}
companies/{companyId}/clientes
companies/{companyId}/os
companies/{companyId}/vendas
companies/{companyId}/financeiro
companies/{companyId}/caixa
companies/{companyId}/funcionarios
companies/{companyId}/configuracoes
```

## 3. Regras seguras

```
match /companies/{companyId}/{document=**} {
  allow read, write: if request.auth != null
    && request.auth.token.companyId == companyId;
}
```

## 4. Serviços

Os repositórios estão em `src/services/repositories.js`. Substitua as funções mock por chamadas ao Firestore usando `companyId` do usuário autenticado.
