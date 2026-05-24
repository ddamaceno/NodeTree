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
- 🌙 Dark mode com persistência de tema
- 📤 Upload de foto de perfil
- 🎯 Drag-and-drop para reordenar links
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
| Frontend | React + Vite |

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

O servidor estará disponível em: **http://localhost:3001**

### Rodar cliente (frontend)

```bash
cd client
npm run dev
```

O cliente estará disponível em: **http://localhost:5173**

### Rodar cliente + servidor

```bash
# Terminal 1 - Servidor
cd server && npm run start

# Terminal 2 - Cliente
cd client && npm run dev
```

---

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|------------|---------|
| `DATABASE_URL` | String de conexão do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | `minha-chave-secreta` |
| `PORT` | Porta do servidor (padrão: 3001) | `3001` |

---

## 📂 Estrutura do Projeto

```
NodeTree/
├── server/              # API RESTful (Express + Prisma)
│   ├── prisma/          # Schema do banco de dados
│   │   └── schema.prisma
│   ├── .env             # Variáveis de ambiente
│   └── package.json
├── client/              # Frontend React + Vite
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
| location | String? | Localização do usuário |
| avatar | String? | URL da foto de perfil |
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

Base URL: `http://localhost:3001/api`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|---------------|
| POST | `/auth/register` | Criar novo usuário | ❌ |
| POST | `/auth/login` | Fazer login | ❌ |
| GET | `/users/me` | Ver meu perfil | ✅ |
| PUT | `/users/me` | Atualizar meu perfil | ✅ |
| POST | `/upload` | Upload de foto de perfil | ✅ |
| GET | `/users/:slug` | Ver perfil público | ❌ |
| GET | `/links` | Listar meus links | ✅ |
| POST | `/links` | Criar novo link | ✅ |
| PUT | `/links/:id` | Atualizar link | ✅ |
| DELETE | `/links/:id` | Excluir link | ✅ |
| PUT | `/links/reorder` | Reordenar links | ✅ |

> ✅ = requer token JWT no header `Authorization: Bearer <token>`

---

## 🏗️ Arquitetura & Diagramas

### 📊 Modelo de Dados

O NodeTree utiliza 3 entidades principais no banco de dados PostgreSQL:

```
┌─────────────────────────┐
│        USERS            │
│  (Usuários do sistema)  │
└──────────┬──────────────┘
           │
           │ 1 usuário cria
           │
           ▼
     ┌─────────────┐
     │ 0..* LINKS  │
     │ (Links do   │
     │  usuário)   │
     └──────┬──────┘
            │
            │ 1 link recebe
            │
            ▼
      ┌────────────┐
      │ 0..* CLICKS│
      │ (Registros │
      │  de clique)│
      └────────────┘
```

### 🗄️ Schema do Banco de Dados

```mermaid
erDiagram
    USERS ||--o{ LINKS : cria
    LINKS ||--o{ CLICKS : registra
    
    USERS {
        string id PK
        string email UK
        string password
        string? slug UK
        string? displayName
        string? bio
        string? location
        string? avatar
        string theme
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    LINKS {
        string id PK
        string title
        string url
        string? description
        int clicks
        string userId FK
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    CLICKS {
        string id PK
        string linkId FK
        timestamptz clickedAt
    }
```

### 📝 Descrição das Entidades

| Entidade | Descrição | Exemplo de Uso |
|----------|-----------|----------------|
| **USERS** | Usuários cadastrados no sistema | `display_name: "João Silva"`, `slug: "joao"`, `theme: "dark"` |
| **LINKS** | Links adicionados pelo usuário | `title: "Meu LinkedIn"`, `url: "linkedin.com/in/joao"`, `clicks: 42` |
| **CLICKS** | Registro de cada clique em um link | `clicked_at: "2026-05-24 15:30:00"` |

### 🔑 Legenda

| Símbolo | Significado | Exemplo |
|---------|-------------|---------|
| `PK` | Chave primária (Primary Key) | `id` - Identificador único |
| `FK` | Chave estrangeira (Foreign Key) | `userId` - Referencia tabela USERS |
| `UK` | Campo único (Unique) | `email` - Não pode repetir |
| `?` | Campo opcional (Nullable) | `bio` - Pode ser vazio |
| `||--o{` | Relacionamento 1 para muitos | 1 USER → 0..* LINKS |

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
