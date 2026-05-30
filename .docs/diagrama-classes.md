# Diagrama de Classes — NodeTree

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

## Notações

| Símbolo | Significado |
|---|---|
| `+` | Visibilidade pública (UML) |
| `<<Entity>>` | Entidade persistente no banco de dados |
| `UUID`, `String`, `Integer`, `DateTime` | Tipos dos atributos |
| `[0..1]` | Atributo opcional (nullable) |
| `1 → 0..*` | Relação um para muitos (agregação) |

## Mapeamento para o banco

| Classe | Tabela |
|---|---|
| `User` | `users` |
| `Link` | `links` |
| `Click` | `clicks` |

### Chaves estrangeiras

| Origem | Destino | Deleção em cascata |
|---|---|---|
| `links.user_id` → `users.id` | `Link.userId` → `User.id` | Sim |
| `clicks.link_id` → `links.id` | `Click.linkId` → `Link.id` | Sim |
