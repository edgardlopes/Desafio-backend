Back-end do Desafio

Front-end pode ser encontrado [aqui](https://github.com/edgardlopes/frontend-challenge)

Consiste de uma api que gerencia arquivos, gerando URLs pré-assinadas para ser feito upload no S3.

Também expoe uma API que dispara o processamento assincro do arquivo.
Para isso foi usado o BullMQ que permite executar servicos pesados em backgroud, essa task eh responsavel por fazer o streaming do arquivo e salvar os dados no banco de dados Postgres.

![Untitled Diagram drawio](https://github.com/edgardlopes/Desafio-backend/assets/12161982/a86090b9-a519-4246-b46e-03597853dd92)

## Infra

Dentro da pasta `infra` existe o necessário para criação do bucket do S3. Para isso execute `cdk deploy`
CDK é uma ferramenta da Amazon de Infrastructure as a Code, que permite criar criar e gerenciar recursos na AWS usando linguagem de programação, nesse caso TypeScript

## Como Executar

Para executar o back-end local eh necessário possuir o Docker e Docker Compose Instalado em seu ambiente.
Também eh necessário criar um bucket no S3 manualmente ou usando o CDK para isso
Com o bucket criado basta inserir seu nome na variavel de ambiente `BUCKET_NAME` no arquivo `.env`

Isso feito o proximo passo eh executar `docker compose up` e em outro terminal executar `npm start`
