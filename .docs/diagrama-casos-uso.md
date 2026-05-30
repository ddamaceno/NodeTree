# Diagrama de Casos de Uso — NodeTree

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

## Atores

| Ator | Descrição |
|---|---|
| **Visitante** | Usuário não autenticado que navega por perfis públicos |
| **Usuário Autenticado** | Usuário registrado e logado que gerencia seu perfil e links |

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
| UC05 | Fazer logout | Usuário | Encerra a sessão | `POST /auth/logout` |

### Gerenciamento

| # | Caso de uso | Ator | Descrição | Endpoint |
|---|---|---|---|---|
| UC06 | Gerenciar perfil | Usuário | Altera dados do perfil (nome, bio, avatar, tema) | `PUT /users/me` |
| UC07 | Criar link | Usuário | Adiciona novo link ao perfil | `POST /links` |
| UC08 | Editar link | Usuário | Altera título ou URL de um link | `PUT /links/:id` |
| UC09 | Excluir link | Usuário | Remove um link e seus registros de clique | `DELETE /links/:id` |
| UC10 | Reordenar links | Usuário | Altera a ordem dos links via drag-and-drop | `PUT /links/reorder` |
| UC11 | Visualizar analytics | Usuário | Consulta estatísticas de cliques | `GET /links/analytics` |

## Notações UML

| Símbolo | Significado |
|---|---|
| `⟶` | Comunicação entre ator e caso de uso |
| `-.-` `<<include>>` | O caso base sempre executa o caso incluído |
| `-.-` `<<extend>>` | O caso base pode, opcionalmente, estender-se |
