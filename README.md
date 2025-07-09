# Flashcards Backend

Este é o backend do aplicativo de Flashcards, responsável por gerenciar autenticação, decks, cartões e lógica de repetição espaçada. Utiliza Node.js, Fastify e PostgreSQL (via Supabase).

## Tecnologias Utilizadas
- [Node.js]
- [Fastify]
- [PostgreSQL] (via [Supabase])
- [pg](cliente PostgreSQL)
- [bcrypt](hash de senhas)
- [validator](validação de e-mail)

## Estrutura de Pastas

```
packages/backend/
├── src/
│   ├── controllers/   # Lógica dos endpoints
│   ├── models/        # Acesso ao banco de dados
│   ├── routes/        # Definição das rotas
│   ├── services/      # Regras de negócio
│   └── server.js      # Inicialização do servidor Fastify
├── .env               # Variáveis de ambiente (NÃO subir para o git)
├── package.json
└── README.md
```

## Configuração

1. **Clone o repositório**
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure o arquivo `.env`:**
   Crie um arquivo `.env` na raiz do backend com a variável:
   ```env
   DATABASE_URL=postgresql://usuario:senha@host:porta/banco
   ```
   (Use a string de conexão do Supabase ou do seu PostgreSQL)

## Comandos

- `npm start` — Inicia o servidor em modo produção
- `npm run dev` — Inicia o servidor com hot reload