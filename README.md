Back-end do Desafio

Front-end pode ser encontrado (aqui)[https://github.com/edgardlopes/frontend-challenge]


Consiste de uma api que gerencia arquivos, gerando URLs pré-assinadas para ser feito upload no S3.

Também expoe uma API que dispara o processamento assincro do arquivo. 
Para isso foi usado o BullMQ que permite executar servicos pesados em backgroud, essa task eh responsavel por fazer o streaming do arquivo e salvar os dados no banco de dados Postgres.

![Untitled Diagram drawio](https://github.com/edgardlopes/Desafio-backend/assets/12161982/a86090b9-a519-4246-b46e-03597853dd92)
