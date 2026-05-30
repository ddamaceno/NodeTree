# Data Model Guide

NodeTree persiste estado em um banco PostgreSQL gerenciado via Prisma ORM. O schema é ownership das migrações em `prisma/migrations/` e aplicado transacionalmente pelo Prisma na inicialização (`prisma db push` em dev, `prisma migrate deploy` em produção).

## Stack de persistência

| Camada | Tecnologia |
|---|---|
| Banco | PostgreSQL 14+ |
| Driver | `@prisma/client` (Prisma Engine) |
| Migrações | Prisma Migrate (`prisma/migrations/`) |
| Pool | Prisma internals via `DATABASE_URL` |
| ID primário | `UUID` nativo PostgreSQL via `gen_random_uuid()` |

## Diagrama ER

```mermaid
classDiagram
    class User {
        <<Entity>>
        +UUID id PK
        +String email UK
        +String password
        +String? slug UK
        +String? displayName
        +String? bio
        +String? location
        +String? avatar
        +String? messageToReaders
        +String theme
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Link {
        <<Entity>>
        +UUID id PK
        +String title
        +String url
        +String? description
        +String? image
        +Int order
        +Int clicks
        +UUID userId FK
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Click {
        <<Entity>>
        +UUID id PK
        +UUID linkId FK
        +DateTime clickedAt
    }

    User "1" --> "0..*" Link : owns
    Link "1" --> "0..*" Click : logs
```

## Entidades

### `users` (tabela: `users`)

| Coluna Prisma | Coluna SQL | Tipo Prisma | Tipo SQL | Atributos | Descrição |
|---|---|---|---|---|---|
| `id` | `id` | `String` | `UUID` | `@id @default(dbgenerated("gen_random_uuid()"))` | Chave primária UUID |
| `email` | `email` | `String` | `TEXT` | `@unique` | Email único do usuário |
| `password` | `password` | `String` | `TEXT` | — | Hash bcrypt (10 rounds) |
| `slug` | `slug` | `String?` | `TEXT` | `@unique` | Slug público único (identificador na URL) |
| `displayName` | `display_name` | `String?` | `TEXT` | `@map("display_name")` | Nome de exibição |
| `bio` | `bio` | `String?` | `TEXT` | — | Biografia / descrição |
| `location` | `location` | `String?` | `TEXT` | — | Localização geográfica |
| `avatar` | `avatar` | `String?` | `TEXT` | — | Caminho da foto de perfil |
| `messageToReaders` | `message_to_readers` | `String?` | `TEXT` | `@map("message_to_readers")` | Mensagem para visitantes |
| `theme` | `theme` | `String` | `TEXT` | `@default("light")` | Tema (light/dark) |
| `createdAt` | `createdAt` | `DateTime` | `TIMESTAMPTZ` | `@default(now())` | Data de criação |
| `updatedAt` | `updatedAt` | `DateTime` | `TIMESTAMPTZ` | `@updatedAt` | Data da última atualização |

**Relacionamentos:**
- `links Link[]` — um usuário possui muitos links (cascade on delete)

**Índices exclusivos:**
- `users_email_key` ON `email`
- `users_slug_key` ON `slug`

---

### `links` (tabela: `links`)

| Coluna Prisma | Coluna SQL | Tipo Prisma | Tipo SQL | Atributos | Descrição |
|---|---|---|---|---|---|
| `id` | `id` | `String` | `UUID` | `@id @default(dbgenerated("gen_random_uuid()"))` | Chave primária UUID |
| `title` | `title` | `String` | `TEXT` | — | Título do link |
| `url` | `url` | `String` | `TEXT` | — | URL de destino |
| `description` | `description` | `String?` | `TEXT` | — | Descrição opcional |
| `image` | `image` | `String?` | `TEXT` | — | Imagem de preview opcional |
| `order` | `order` | `Int` | `INTEGER` | `@default(0)` | Posição na ordenação |
| `clicks` | `clicks` | `Int` | `INTEGER` | `@default(0)` | Contador de cliques (desnormalizado) |
| `userId` | `user_id` | `String` | `UUID` | `@map("user_id")` | FK para `users.id` |
| `createdAt` | `createdAt` | `DateTime` | `TIMESTAMPTZ` | `@default(now())` | Data de criação |
| `updatedAt` | `updatedAt` | `DateTime` | `TIMESTAMPTZ` | `@updatedAt` | Data da última atualização |

**Relacionamentos:**
- `user User @relation(fields: [userId], references: [id], onDelete: Cascade)` — pertence a um usuário
- `clickLogs Click[]` — um link possui muitos registros de clique (cascade on delete)

**Foreign Key:**
- `links_user_id_fkey` — `user_id` → `users(id)` ON DELETE CASCADE ON UPDATE CASCADE

---

### `clicks` (tabela: `clicks`)

| Coluna Prisma | Coluna SQL | Tipo Prisma | Tipo SQL | Atributos | Descrição |
|---|---|---|---|---|---|
| `id` | `id` | `String` | `UUID` | `@id @default(dbgenerated("gen_random_uuid()"))` | Chave primária UUID |
| `linkId` | `link_id` | `String` | `UUID` | `@map("link_id")` | FK para `links.id` |
| `clickedAt` | `clickedAt` | `DateTime` | `TIMESTAMPTZ` | `@default(now())` | Timestamp do clique |

**Relacionamentos:**
- `link Link @relation(fields: [linkId], references: [id], onDelete: Cascade)` — pertence a um link

**Foreign Key:**
- `clicks_link_id_fkey` — `link_id` → `links(id)` ON DELETE CASCADE ON UPDATE CASCADE

---

## Migrações

As migrações são gerenciadas pelo Prisma Migrate e aplicadas em ordem. Cada migration gera um diretório com timestamp dentro de `prisma/migrations/`.

| Migration | O que adiciona |
|---|---|
| `20260226003611_init_database` | Tabelas `users` (id TEXT, email, password, slug, display_name, bio) e `links` (id TEXT, title, url, order, user_id FK). Índices unique em `users.email` e `users.slug`. |
| `20260505225653_add_click_model_and_user_fields` | Converte IDs de TEXT para UUID nativo (`gen_random_uuid()`). Adiciona colunas `avatar`, `location`, `message_to_readers`, `theme` em `users`. Adiciona `clicks`, `description`, `image` em `links`. Cria tabela `clicks` (id UUID, link_id UUID FK, clickedAt TIMESTAMPTZ). |

### Detalhamento

**Migration 001 (`init_database`):**
```sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "slug" TEXT,
    "display_name" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_slug_key" ON "users"("slug");

ALTER TABLE "links" ADD CONSTRAINT "links_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

**Migration 002 (`add_click_model_and_user_fields`):**
```sql
-- Migração destrutiva: converte TEXT → UUID, droppa e recria colunas
ALTER TABLE "links" DROP CONSTRAINT "links_user_id_fkey";

ALTER TABLE "links" DROP CONSTRAINT "links_pkey",
    ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "description" TEXT,
    ADD COLUMN "image" TEXT,
    DROP COLUMN "id",
    ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    DROP COLUMN "user_id",
    ADD COLUMN "user_id" UUID NOT NULL,
    ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
    ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ,
    ADD CONSTRAINT "links_pkey" PRIMARY KEY ("id");

ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
    ADD COLUMN "avatar" TEXT,
    ADD COLUMN "location" TEXT,
    ADD COLUMN "message_to_readers" TEXT,
    ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'light',
    DROP COLUMN "id",
    ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
    ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ,
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

CREATE TABLE "clicks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "link_id" UUID NOT NULL,
    "clickedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "links" ADD CONSTRAINT "links_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_fkey"
    FOREIGN KEY ("link_id") REFERENCES "links"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Índices

| Índice | Tabela | Coluna(s) | Tipo | Propósito |
|---|---|---|---|---|
| `users_pkey` | `users` | `id` | PRIMARY KEY | Identificação única |
| `users_email_key` | `users` | `email` | UNIQUE | Login único |
| `users_slug_key` | `users` | `slug` | UNIQUE | Rota pública única |
| `links_pkey` | `links` | `id` | PRIMARY KEY | Identificação única |
| `links_user_id_fkey` | `links` | `user_id` | INDEX (FK implícito) | Filtro por usuário |
| `clicks_pkey` | `clicks` | `id` | PRIMARY KEY | Identificação única |
| `clicks_link_id_fkey` | `clicks` | `link_id` | INDEX (FK implícito) | Filtro por link |

Os índices das FKs são criados automaticamente pelo PostgreSQL quando a constraint FOREIGN KEY é definida. A ordenação de links por `order` ASC é feita via `ORDER BY` na query (sem índice dedicado — viável para o volume esperado por usuário).

---

## Invariantes e regras de negócio

1. **Slug único**: cada usuário deve ter um `slug` único (quando definido). É a chave pública para acesso ao perfil via `/:slug`.

2. **Cascade de deleção**: a deleção de um usuário cascateia para todos os seus links, que por sua vez cascateiam para todos os registros de clique. Não há órfãos.

3. **Transação atômica no click analytics**: o incremento do contador `links.clicks` e a criação do registro em `clicks` acontecem dentro de uma única transação Prisma (`$transaction`). Se uma das operações falha, ambas são revertidas.

4. **Reorder batch transaction**: a reordenação de links atualiza o campo `order` de múltiplos links dentro de uma transação. Se qualquer atualização falha, todas as alterações de ordem são revertidas.

5. **UUID nativo**: todas as chaves primárias usam `gen_random_uuid()` do PostgreSQL, sem dependência de geração no lado da aplicação.

6. **Hash de senha**: senhas são armazenadas como hash bcrypt com 10 rounds de salt. O campo `password` nunca é exposto nas respostas da API.

7. **Validação de unicidade**: tanto email quanto slug são verificados contra duplicatas antes da criação do usuário (camada de aplicação, não constraint violada).

---

## API → Schema mapping

Cada endpoint e sua operação Prisma correspondente:

| Método | Path | Auth | Controller | Operação Prisma | Tabelas afetadas |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | No | `auth.js` | `prisma.user.create` | `users` |
| `POST` | `/auth/login` | No | `auth.js` | `prisma.user.findUnique` | `users` (leitura) |
| `POST` | `/auth/logout` | No | `auth.js` | — (limpa cookie) | — |
| `GET` | `/users/me` | JWT | `users.js` | `prisma.user.findUnique` | `users` (leitura) |
| `PUT` | `/users/me` | JWT | `users.js` | `prisma.user.update` | `users` |
| `POST` | `/upload` | JWT | `users.js` | — (multer disk storage) | sistema de arquivos |
| `GET` | `/users/:slug` | No | `users.js` | `prisma.user.findUnique` | `users` (leitura) |
| `POST` | `/links` | JWT | `links.js` | `prisma.link.create` | `links` |
| `GET` | `/links?userId=` | No | `links.js` | `prisma.link.findMany` | `links` (leitura) |
| `GET` | `/links/public/:slug` | No | `links.js` | `prisma.user.findUnique` + `prisma.link.findMany` | `users`, `links` (leitura) |
| `GET` | `/links/analytics` | JWT | `links.js` | `prisma.link.findMany` (select parcial, ordenado por clicks DESC) | `links` (leitura) |
| `PUT` | `/links/reorder` | JWT | `links.js` | `prisma.$transaction([...link.update])` | `links` |
| `POST` | `/links/:id/click` | No | `links.js` | `prisma.$transaction([link.update {increment}, click.create])` | `links`, `clicks` |
| `PUT` | `/links/:id` | JWT | `links.js` | `prisma.link.update` | `links` |
| `DELETE` | `/links/:id` | JWT | `links.js` | `prisma.link.delete` | `links` (cascade p/ `clicks`) |
| `POST` | `/clicks/:linkId` | No | `clicks.js` | `prisma.link.findUnique` + `prisma.$transaction` | `links`, `clicks` |

---

## Fluxos de dados (Reader/Writer cheat-sheet)

| Superfície | O que lê | Arquivo |
|---|---|---|
| Login/Registro | `prisma.user.findUnique` (email), `prisma.user.create` (registro) | `routes/auth.js` |
| Perfil autenticado | `prisma.user.findUnique` (by id do JWT) | `routes/users.js:29` |
| Perfil público | `prisma.user.findUnique` (by slug) | `routes/users.js:78` |
| Lista de links (admin) | `prisma.link.findMany` (by userId, order ASC) | `routes/links.js:74` |
| Lista de links (público) | `prisma.user.findUnique` (slug) → `prisma.link.findMany` (userId) | `routes/links.js:93` |
| Analytics | `prisma.link.findMany` (select: id, title, url, clicks; order DESC) | `routes/links.js:154` |
| Clique (incremento + log) | `prisma.$transaction(link.update {increment} + click.create)` | `routes/clicks.js:25`, `routes/links.js:117` |
| Reorder | `prisma.$transaction(orderedIds.map(link.update {order: index}))` | `routes/links.js:207` |

### Fluxo de autenticação

```
[Login/Register] → POST /auth/login (ou /register)
  → prisma.user.findUnique (email) / prisma.user.create
  → jwt.sign({ userId }, secret, { expiresIn: '7d' })
  → res.cookie('token', token, { httpOnly }) + res.json({ token, user })

[Requests autenticados] → Authorization: Bearer <token>
  → middleware verifyToken (jwt.verify → req.userId)
  → controller usa req.userId para filtrar dados do usuário
```

### Fluxo de analytics de clique

```
[Usuário visita página pública] → clica em link
  → e.preventDefault()
  → POST /clicks/:linkId (ou POST /links/:id/click)
  → prisma.$transaction([
      link.update({ where: { id }, data: { clicks: { increment: 1 } } }),
      click.create({ data: { linkId } })
    ])
  → window.open(link.url, '_blank')
```

### Fluxo de reordenação (drag-and-drop)

```
[AdminApp] → @dnd-kit onDragEnd
  → Reorder local state (array move)
  → PUT /links/reorder { orderedIds: [id1, id2, ...] }
  → prisma.$transaction(
      orderedIds.map((id, index) =>
        link.update({ where: { id }, data: { order: index } })
      )
    )
  → re-fetch links
```

---

## Diagrama de classes TypeScript

```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string? slug
        +string? displayName
        +string? bio
        +string? location
        +string? avatar
        +string? messageToReaders
        +string theme
        +Date createdAt
        +Date updatedAt
    }

    class Link {
        +string id
        +string title
        +string url
        +string? description
        +string? image
        +number order
        +number clicks
        +string userId
        +Date createdAt
        +Date updatedAt
    }

    class Click {
        +string id
        +string linkId
        +Date clickedAt
    }

    class LinkData {
        +string title
        +string url
        +string userId
        +number? order
        +string? description
    }

    class UpdateLinkData {
        +string? title
        +string? url
        +string? description
    }

    class UpdateUserData {
        +string? displayName
        +string? bio
        +string? location
        +string? avatar
        +string? theme
        +string? messageToReaders
    }

    User "1" --> "*" Link : owns
    Link "1" --> "*" Click : logs
    LinkData --|> Link : extends
    UpdateLinkData ..> Link : patches
    UpdateUserData ..> User : patches
```

Os tipos estão definidos em dois locais:

- **`shared/types/index.ts`** — interfaces `User` e `Link` (compartilhadas entre frontend e backend, sem dependências)
- **`client/src/services/api.ts`** — interfaces `LinkData`, `UpdateLinkData`, `UpdateUserData` (específicas do cliente) e redefinições de `Link` e `User` com tipos serializados (string para Date)

---

## Configuração de conexão

A conexão com o banco é configurada via variável de ambiente no arquivo `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nodetree?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3001
```

**Prisma datasource** (`prisma/schema.prisma`):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Comandos úteis:**
```bash
# Aplicar migrações em desenvolvimento
npx prisma migrate dev

# Aplicar migrações em produção
npx prisma migrate deploy

# Gerar Prisma Client após alterações no schema
npx prisma generate

# Seed de desenvolvimento
node seed.js

# Visualizar dados no Prisma Studio
npx prisma studio
```

### Pool de conexões

O Prisma Client gerencia internamente um pool de conexões com o PostgreSQL. O tamanho do pool pode ser configurado via parâmetros na `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nodetree?schema=public&connection_limit=5"
```

---

## Onde aprender mais

- Schema completo: `prisma/schema.prisma`
- Migrações: `prisma/migrations/`
- Rotas da API: `routes/auth.js`, `routes/users.js`, `routes/links.js`, `routes/clicks.js`
- Middleware de autenticação: `middleware/auth.js`
- Seed de desenvolvimento: `seed.js`
- Tipos compartilhados: `shared/types/index.ts`
- Cliente API (frontend): `client/src/services/api.ts`
