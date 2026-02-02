# Guia rápido Firebase - Assistec OS

## 1. Projeto e autenticação

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative **Authentication**:
   - Provedores: Google + E-mail/Senha.
3. Cadastre um usuário admin inicial.

## 2. Firestore

Crie as coleções principais (uma por loja/empresa):

```
companies/{companyId}
companies/{companyId}/clientes
companies/{companyId}/os
companies/{companyId}/produtos
companies/{companyId}/financeiro
companies/{companyId}/funcionarios
companies/{companyId}/garantias
companies/{companyId}/impressoes
```

## 3. Estrutura multi-empresa

- Cada usuário possui o `companyId` associado.
- Todas as consultas usam `companyId` como filtro.
- Sugestão: use `customClaims` para armazenar roles.

## 4. Segurança

Regras de segurança sugeridas (exemplo):

```
match /companies/{companyId}/{document=**} {
  allow read, write: if request.auth != null
    && request.auth.token.companyId == companyId;
}
```

## 5. Próximos passos

- Integrar a SDK do Firebase no arquivo `assets/firebase.js`.
- Substituir o armazenamento local pelo Firestore.
- Ativar autenticação real com Google e email/senha.
