# Data Model Guide — NodeTree

## Stack de persistência

| Camada | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL 14+ |
| ORM | Prisma 6 |
| Driver | `@prisma/client` (Prisma Engine) |
| ID primário | UUID nativo via `gen_random_uuid()` |
| Pool de conexões | Gerenciado pelo Prisma Client via `DATABASE_URL` |

## Diagramas

Os diagramas UML estão disponíveis como arquivos editáveis do Draw.io:

| Diagrama | Arquivo |
|---|---|
| Diagrama de classes | [`diagrama-classes.drawio`](diagrama-classes.drawio) |
| Diagrama de casos de uso | [`diagrama-casos-uso.drawio`](diagrama-casos-uso.drawio) |

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
| GET | `/users/:slug` | — | `user.findUnique` | User (leitura) |
| POST | `/upload` | JWT | — (multer) | filesystem |
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
