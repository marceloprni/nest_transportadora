# FastFeet - Desafio Final

<h1 align="center">
  <img alt="Fastfeet" title="Fastfeet" src=".github/logo.png" width="300px" />
</h1>

## Sobre

A aplicação é uma transportadora fictícia. O projeto está no formato de Monorepo com as respectivas pastas Backend, Frontend e Mobile.

- <a href="#backend">Backend</a>


### Tecnologias

- [Node.js](https://nodejs.org/en/)
- [React](https://reactjs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Express](https://github.com/expressjs/express)
- [Redis](https://redis.io/)
- [Bee-Queue](https://github.com/bee-queue/bee-queue)

## Instalcação

Clonar o projeto

```sh
git clone https://github.com/marceloprni/nest_transportadora.git
```

### Backend

#### Dependencias para rodar

- Node.js
- PostgreSQL
- Redis

Instalar as dependencias

```sh
cd backend && yarn
```

Após instalar as dependencias, rodar o comando abaixo e preencher as variaveis de ambiente

```sh
cp .env.example .env
```

Com PostgreSQL rodando e as variaveis de ambiente preenchidas, execute

```sh
yarn sequelize db:migrate
yarn sequelize db:seed
```

O backend tem dois serviços a API e uma Fila. Rode os comandos abaixo em dois terminais separados

```sh
yarn dev
yarn queue
```


