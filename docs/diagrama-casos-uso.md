# Diagrama de Casos de Uso — NodeTree

```mermaid
---
title: Diagrama de Casos de Uso — NodeTree
---
flowchart TB
    V([Visitante])
    V --> UC01("Visualizar perfil público")
    UC01 --> UC02("Clicar em link")

    U([Usuário])
    U --> UC03("1. Registrar conta")
    U --> UC04("2. Fazer login")

    UC04 --> UA([Usuário Autenticado])

    UA --> UC05("Fazer logout")
    UA --> UC06("Gerenciar perfil")
    UA --> UC07("Criar link")
    UA --> UC08("Editar link")
    UA --> UC09("Excluir link")
    UA --> UC10("Reordenar links")
    UA --> UC11("Visualizar analytics")
```

## Atores

| Ator | Descrição |
|---|---|
| **Visitante** | Usuário não autenticado que navega por perfis públicos |
| **Usuário** | Pessoa que possui ou vai criar uma conta no sistema |
| **Usuário Autenticado** | Usuário logado que gerencia seu perfil e links |

## Casos de uso

### Visita

| # | Caso de uso | Ator | Descrição | Endpoint |
|---|---|---|---|---|
| UC01 | Visualizar perfil público | Visitante | Acessa a página pública de um usuário pelo slug | `GET /users/:slug` |
| UC02 | Clicar em link | Visitante | Registra um clique em um link da página pública | `POST /clicks/:linkId` |

### Autenticação

| # | Caso de uso | Ator | Descrição | Endpoint |
|---|---|---|---|---|
| UC03 | Registrar conta | Usuário | Cria nova conta com email, senha e slug | `POST /auth/register` |
| UC04 | Fazer login | Usuário | Autentica e recebe token JWT | `POST /auth/login` |
| UC05 | Fazer logout | Usuário Autenticado | Encerra a sessão | `POST /auth/logout` |

### Gerenciamento

| # | Caso de uso | Ator | Descrição | Endpoint |
|---|---|---|---|---|
| UC06 | Gerenciar perfil | Usuário Autenticado | Altera dados do perfil (nome, bio, avatar, tema) | `PUT /users/me` |
| UC07 | Criar link | Usuário Autenticado | Adiciona novo link ao perfil | `POST /links` |
| UC08 | Editar link | Usuário Autenticado | Altera título ou URL de um link | `PUT /links/:id` |
| UC09 | Excluir link | Usuário Autenticado | Remove um link e seus registros de clique | `DELETE /links/:id` |
| UC10 | Reordenar links | Usuário Autenticado | Altera a ordem dos links via drag-and-drop | `PUT /links/reorder` |
| UC11 | Visualizar analytics | Usuário Autenticado | Consulta estatísticas de cliques | `GET /links/analytics` |

## Notações UML

| Símbolo | Significado |
|---|---|
| `⟶` | Comunicação entre ator e caso de uso |
| `-.-` `<<include>>` | O caso base sempre executa o caso incluído |
| `-.-` `<<extend>>` | O caso base pode, opcionalmente, estender-se |
