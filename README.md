# Assistec OS

Aplicativo web responsivo para gestão de assistência técnica (celulares, computadores e notebooks). Pensado para se tornar um SaaS multi-empresa com Firebase.

## Funcionalidades prontas

- Autenticação (fluxo visual com Google e e-mail/senha).
- Cadastro de clientes, OS, produtos, financeiro e funcionários.
- Configurações de empresa e personalização de garantias.
- Módulo de impressão térmica 58mm com pré-visualização.
- Dashboard com indicadores principais.

## Rodando localmente

Basta abrir o arquivo `index.html` no navegador.

Para um servidor local simples:

```bash
python -m http.server 8080
```

Acesse: `http://localhost:8080`

## Estrutura

```
assets/
  app.js         # lógica da interface
  styles.css     # layout e tema visual
index.html       # layout principal
 docs/firebase.md # guia para integração Firebase
```

## Firebase

Veja o guia em `docs/firebase.md` para conectar o Firestore e autenticação reais.
