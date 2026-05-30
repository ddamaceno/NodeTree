# Diagrama de classes TypeScript

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
        +getLinks() Link[]
    }

    class Link {
        +string id
        +string title
        +string url
        +string? description
        +string? image
        +int order
        +int clicks
        +string userId
        +Date createdAt
        +Date updatedAt
        +getUser() User
        +getClickLogs() Click[]
    }

    class LinkData {
        +string title
        +string url
        +string userId
        +int? order
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

    class Click {
        +string id
        +string linkId
        +Date clickedAt
        +getLink() Link
    }

    User "1" --> "*" Link : owns
    Click "*" --> "1" Link : belongs to
    LinkData --|> Link : extends
    UpdateLinkData ..> Link : patches
    UpdateUserData ..> User : patches
```

Os tipos estão definidos em dois locais:

- **`shared/types/index.ts`** — interfaces `User` e `Link` (compartilhadas entre frontend e backend, sem dependências)
- **`client/src/services/api.ts`** — interfaces `LinkData`, `UpdateLinkData`, `UpdateUserData` (específicas do cliente) e redefinições de `Link` e `User` com tipos serializados (string para Date)
