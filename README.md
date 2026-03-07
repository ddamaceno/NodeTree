# NodeTree

Plataforma minimalista para agregar links com analytics de cliques.

---

## O que é o NodeTree?

O **NodeTree** é uma ferramenta que permite criar uma página pessoal com todos os seus links importantes (redes sociais, portfólio, contatos, etc) em um único lugar — similar ao Linktree, mas com design minimalista e foco em performance.

**Funcionalidades principais:**
- 🔐 Autenticação segura (JWT + Bcrypt)
- 👤 Perfil público personalizado (seusite.com/seu-nome)
- 🔗 Gerenciamento de links (criar, editar, ordenar, excluir)
- 📊 Sistema de analytics para acompanhar cliques
- API RESTful com Prisma ORM

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 18+ |
| Servidor | Express.js 5 |
| Banco de dados | PostgreSQL |
| ORM | Prisma 6 |
| Autenticação | JWT, Bcrypt |
| Frontend | React + Vite (em desenvolvimento) |

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- **Node.js** (versão 18 ou superior) — [baixe aqui](https://nodejs.org/)
- **PostgreSQL** (versão 14 ou superior) — [baixe aqui](https://www.postgresql.org/download/)
- **npm** ou **yarn** (já vem com o Node.js)

---

## 🚀 Instalação

Siga estes passos para configurar o projeto na sua máquina:

### 1. Clone o repositório

```bash
git clone https://github.com/ddamaceno/NodeTree.git
cd NodeTree
```

### 2. Instale as dependências do projeto

```bash
npm install
```

### 3. Instale as dependências do servidor

```bash
cd server
npm install
```

### 4. Configure o banco de dados

Crie um arquivo chamado `.env` dentro da pasta `server/`:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/nodetree?schema=public"
JWT_SECRET="uma_chave_secreta_segura"
PORT=5000
```

> ⚠️ **Importante:** Substitua `seu_usuario` e `sua_senha` pelas suas credenciais do PostgreSQL.

### 5. Gere o cliente do Prisma

```bash
npx prisma generate
```

### 6. Crie as tabelas no banco

```bash
npx prisma db push
```

---

## ▶️ Como rodar o projeto

### Rodar apenas o servidor (backend)

```bash
cd server
npm run start
```

O servidor estará disponível em: **http://localhost:5000**

### Rodar cliente + servidor (quando disponível)

```bash
npm run dev
```

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|------------|---------|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | `minha-chave-secreta` |
| `PORT` | Porta do servidor (padrão: 5000) | `5000` |

---

## 📂 Estrutura do Projeto

```
NodeTree/
├── server/              # API RESTful (Express + Prisma)
│   ├── prisma/          # Schema do banco de dados
│   │   └── schema.prisma
│   ├── .env             # Variáveis de ambiente
│   └── package.json
├── client/              # Frontend React (em desenvolvimento)
├── package.json         # Scripts do projeto
└── README.md
```

---

## 🗄️ Schema do Banco de Dados

### User (Usuário)

| Campo | Tipo | Descrição |
|-------|------|------------|
| id | UUID | Chave primária |
| email | String | Email único do usuário |
| password | String | Senha hasheada com Bcrypt |
| slug | String | URL personalizada do perfil |
| displayName | String? | Nome exibido no perfil |
| bio | String? | Biografia do perfil |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data da última atualização |

### Link

| Campo | Tipo | Descrição |
|-------|------|------------|
| id | UUID | Chave primária |
| title | String | Título do link |
| url | String | URL de destino |
| order | Int | Ordem de exibição |
| userId | UUID | Chave estrangeira do usuário |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data da última atualização |

---

## 📡 Endpoints da API

Base URL: `http://localhost:5000/api`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---------------|
| POST | `/auth/register` | Criar novo usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| GET | `/users/:slug` | Ver perfil público | ❌ |
| GET | `/links` | Listar meus links | ✅ |
| POST | `/links` | Criar novo link | ✅ |
| PUT | `/links/:id` | Atualizar link | ✅ |
| DELETE | `/links/:id` | Excluir link | ✅ |

> ✅ = requer token JWT no header `Authorization: Bearer <token>`

---

## 🤝 Como contribuir

1. **Fork** este repositório
2. Crie uma branch para sua feature: `git checkout -b feature/nome`
3. Faça suas alterações e commite: `git commit -m 'Minha nova feature'`
4. Envie para o repositório remoto: `git push origin feature/nome`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
