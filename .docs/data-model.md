# Data Model Guide — NodeTree

## Stack de persistência

| Camada | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL 14+ |
| ORM | Prisma 6 |
| Driver | `@prisma/client` (Prisma Engine) |
| ID primário | UUID nativo via `gen_random_uuid()` |
| Pool de conexões | Gerenciado pelo Prisma Client via `DATABASE_URL` |

## Diagrama de classes

```mermaid
---
title: Diagrama de Classes — NodeTree
---
classDiagram
    class User {
        <<Entity>>
        + id: UUID
        + email: String
        + password: String
        + slug: String[0..1]
        + displayName: String[0..1]
        + bio: String[0..1]
        + location: String[0..1]
        + avatar: String[0..1]
        + messageToReaders: String[0..1]
        + theme: String
        + createdAt: DateTime
        + updatedAt: DateTime
    }

    class Link {
        <<Entity>>
        + id: UUID
        + title: String
        + url: String
        + description: String[0..1]
        + image: String[0..1]
        + order: Integer
        + clicks: Integer
        + userId: UUID
        + createdAt: DateTime
        + updatedAt: DateTime
    }

    class Click {
        <<Entity>>
        + id: UUID
        + linkId: UUID
        + clickedAt: DateTime
    }

    User "1" --> "0..*" Link : possui
    Link "1" --> "0..*" Click : registra
```

### Notações

- `+` — visibilidade pública (UML)
- `UUID`, `String`, `Integer`, `DateTime` — tipos dos atributos
- `[0..1]` — atributo opcional (nullable)
- `1 → 0..*` — relação um para muitos (agregação)
- `<<Entity>>` — entidade persistente no banco de dados

---

## Diagrama de casos de uso

```mermaid
---
title: Diagrama de Casos de Uso — NodeTree
---
flowchart LR
    V([Visitante])
    UA([Usuário<br>Autenticado])

    subgraph SISTEMA[NodeTree]
        direction TB

        subgraph VISITA[" "]
            direction TB
            UC01("Visualizar perfil público")
            UC02("Clicar em link")
        end

        subgraph AUTENTICACAO[" "]
            direction TB
            UC03("Registrar conta")
            UC04("Fazer login")
            UC05("Fazer logout")
        end

        subgraph GERENCIAMENTO[" "]
            direction TB
            UC06("Gerenciar perfil")
            UC07("Criar link")
            UC08("Editar link")
            UC09("Excluir link")
            UC10("Reordenar links")
            UC11("Visualizar analytics")
        end
    end

    V --> UC01
    V --> UC02

    UA --> UC03
    UA --> UC04
    UA --> UC05
    UA --> UC06
    UA --> UC07
    UA --> UC08
    UA --> UC09
    UA --> UC10
    UA --> UC11

    UC06 -.->|<<include>>| UC04
    UC07 -.->|<<include>>| UC04
    UC08 -.->|<<include>>| UC04
    UC09 -.->|<<include>>| UC04
    UC10 -.->|<<include>>| UC04
    UC11 -.->|<<include>>| UC04
    UC04 -.->|<<extend>>| UC03
```

### Atores

| Ator | Descrição |
|---|---|
| **Visitante** | Usuário não autenticado que navega por perfis públicos |
| **Usuário Autenticado** | Usuário registrado e logado que gerencia seu perfil e links |

### Casos de uso

| # | Caso de uso | Ator primário | Descrição |
|---|---|---|---|
| UC01 | Visualizar perfil público | Visitante | Acessa a página pública de um usuário via `/:slug` |
| UC02 | Clicar em link | Visitante | Registra um clique em um link da página pública |
| UC03 | Registrar conta | Usuário Autenticado | Cria uma nova conta (email + senha + slug) |
| UC04 | Fazer login | Usuário Autenticado | Autentica-se no sistema e recebe um token JWT |
| UC05 | Fazer logout | Usuário Autenticado | Encerra a sessão atual |
| UC06 | Gerenciar perfil | Usuário Autenticado | Altera dados do perfil (nome, bio, avatar, tema) |
| UC07 | Criar link | Usuário Autenticado | Adiciona um novo link ao perfil |
| UC08 | Editar link | Usuário Autenticado | Altera título ou URL de um link existente |
| UC09 | Excluir link | Usuário Autenticado | Remove um link e seus registros de clique |
| UC10 | Reordenar links | Usuário Autenticado | Altera a ordem de exibição dos links via drag-and-drop |
| UC11 | Visualizar analytics | Usuário Autenticado | Consulta estatísticas de cliques dos links |

### Notações

- `<include>` — o caso de uso base sempre executa o caso incluído
- `<extend>` — o caso de uso base pode, opcionalmente, estender-se para outro
- As linhas tracejadas representam relacionamentos de inclusão/extensão (UML)

---

## Schema do banco de dados

### Entidade `User` (tabela: `users`)

| Atributo Prisma | Coluna SQL | Tipo SQL | Restrições | Descrição |
|---|---|---|---|---|
| `id` | `id` | `UUID` | `PK`, `gen_random_uuid()` | Identificador único |
| `email` | `email` | `TEXT` | `UNIQUE NOT NULL` | E-mail do usuário |
| `password` | `password` | `TEXT` | `NOT NULL` | Hash bcrypt da senha |
| `slug` | `slug` | `TEXT` | `UNIQUE` | Slug público para URL |
| `displayName` | `display_name` | `TEXT` | — | Nome de exibição |
| `bio` | `bio` | `TEXT` | — | Biografia |
| `location` | `location` | `TEXT` | — | Localização |
| `avatar` | `avatar` | `TEXT` | — | Caminho do avatar |
| `messageToReaders` | `message_to_readers` | `TEXT` | — | Mensagem aos visitantes |
| `theme` | `theme` | `TEXT` | `NOT NULL DEFAULT 'light'` | Tema (light/dark) |
| `createdAt` | `createdAt` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Data de criação |
| `updatedAt` | `updatedAt` | `TIMESTAMPTZ` | `NOT NULL` | Data da última atualização |

**Relacionamentos:**
- `links: Link[]` — um usuário possui zero ou mais links

**Índices:**
- `users_pkey` ON `id` (PRIMARY KEY)
- `users_email_key` ON `email` (UNIQUE)
- `users_slug_key` ON `slug` (UNIQUE)

---

### Entidade `Link` (tabela: `links`)

| Atributo Prisma | Coluna SQL | Tipo SQL | Restrições | Descrição |
|---|---|---|---|---|
| `id` | `id` | `UUID` | `PK`, `gen_random_uuid()` | Identificador único |
| `title` | `title` | `TEXT` | `NOT NULL` | Título do link |
| `url` | `url` | `TEXT` | `NOT NULL` | URL de destino |
| `description` | `description` | `TEXT` | — | Descrição opcional |
| `image` | `image` | `TEXT` | — | URL de imagem opcional |
| `order` | `order` | `INTEGER` | `NOT NULL DEFAULT 0` | Posição na ordenação |
| `clicks` | `clicks` | `INTEGER` | `NOT NULL DEFAULT 0` | Contador de cliques |
| `userId` | `user_id` | `UUID` | `FK → users(id)` | Referência ao usuário |
| `createdAt` | `createdAt` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Data de criação |
| `updatedAt` | `updatedAt` | `TIMESTAMPTZ` | `NOT NULL` | Data da última atualização |

**Relacionamentos:**
- `user: User` — pertence a um usuário (obrigatório)
- `clickLogs: Click[]` — possui zero ou mais registros de clique

**Chave estrangeira:**
- `links_user_id_fkey` ON `user_id` → `users(id)` ON DELETE CASCADE

---

### Entidade `Click` (tabela: `clicks`)

| Atributo Prisma | Coluna SQL | Tipo SQL | Restrições | Descrição |
|---|---|---|---|---|
| `id` | `id` | `UUID` | `PK`, `gen_random_uuid()` | Identificador único |
| `linkId` | `link_id` | `UUID` | `FK → links(id)` | Referência ao link |
| `clickedAt` | `clickedAt` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Timestamp do clique |

**Relacionamentos:**
- `link: Link` — pertence a um link (obrigatório)

**Chave estrangeira:**
- `clicks_link_id_fkey` ON `link_id` → `links(id)` ON DELETE CASCADE

---

## Resumo das migrações

| Migration | Descrição |
|---|---|
| `001_init_database` | Cria `users` (id TEXT, email, password, slug, display_name, bio) e `links` (id TEXT, title, url, order, user_id FK) |
| `002_add_click_model_and_user_fields` | Converte IDs de TEXT para UUID. Adiciona `avatar`, `location`, `message_to_readers`, `theme` em `users`. Adiciona `clicks`, `description`, `image` em `links`. Cria `clicks` (id UUID, link_id FK, clickedAt). |

---

## Invariantes e regras de negócio

1. **Slug único**: cada usuário possui um slug único que define sua URL pública (`/:slug`)
2. **Cascade de deleção**: ao deletar um `User`, todos os seus `Link` são deletados, e todos os `Click` vinculados são deletados em cascata
3. **Transação atômica de clique**: o incremento de `links.clicks` e a criação do registro em `clicks` ocorrem dentro de uma única transação Prisma (`$transaction`)
4. **Reordenação transacional**: a atualização da ordem de múltiplos links ocorre em lote dentro de uma transação atômica
5. **Senha hasheada**: senhas armazenadas como bcrypt (10 rounds); o campo `password` nunca é exposto em respostas da API
6. **UUID nativo**: chaves primárias geradas pelo PostgreSQL via `gen_random_uuid()`, sem dependência de geração externa
7. **Validação de unicidade**: e-mail e slug são verificados contra duplicatas antes da inserção

---

## API — Schema mapping

| Método | Rota | Autenticação | Operação Prisma | Entidades afetadas |
|---|---|---|---|---|
| POST | `/auth/register` | — | `user.create` | User |
| POST | `/auth/login` | — | `user.findUnique` | User (leitura) |
| POST | `/auth/logout` | — | — | — |
| GET | `/users/me` | JWT | `user.findUnique` | User (leitura) |
| PUT | `/users/me` | JWT | `user.update` | User |
| POST | `/upload` | JWT | — (multer) | filesystem |
| GET | `/users/:slug` | — | `user.findUnique` | User (leitura) |
| POST | `/links` | JWT | `link.create` | Link |
| GET | `/links` | — | `link.findMany` | Link (leitura) |
| GET | `/links/public/:slug` | — | `user.findUnique` + `link.findMany` | User, Link (leitura) |
| GET | `/links/analytics` | JWT | `link.findMany` | Link (leitura) |
| PUT | `/links/reorder` | JWT | `$transaction([link.update])` | Link |
| PUT | `/links/:id` | JWT | `link.update` | Link |
| DELETE | `/links/:id` | JWT | `link.delete` | Link (+ Click cascade) |
| POST | `/links/:id/click` | — | `$transaction([link.update, click.create])` | Link, Click |
| POST | `/clicks/:linkId` | — | `link.findUnique` + `$transaction` | Link, Click |

---

## Configuração de conexão

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nodetree?schema=public"
```

Comandos úteis:

```bash
npx prisma migrate dev          # Desenvolvimento
npx prisma migrate deploy        # Produção
npx prisma generate              # Regenerar client
npx prisma studio                # Visualizar dados
node seed.js                     # Popular com dados de teste
```
