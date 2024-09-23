# API de Processamento de Imagens

Criada em Nestjs

## Comandos

- npm install
- docker-compose up --build  

## Endpoints:

- Consulta - http://localhost:3000/api/images/cat.jpg?fm=webp&q=75&w=128&h=128&gray=0
- Upload de imagem - http://localhost:3000/api/images/upload

- Documentação em : http://localhost:3000/api

## Imagens que já estão num bucket da S3: 

- [cat.jpg](https://pictures-processing.s3.amazonaws.com/pictures/cat.jpg)
- [dog.png](https://pictures-processing.s3.amazonaws.com/pictures/dog.png)
- [nature.webp](https://pictures-processing.s3.amazonaws.com/pictures/nature.webp)
