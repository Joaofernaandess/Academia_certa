Integrantes do grupo:

Fábio Matheus - RA: 192512977
João Victor Fernandes - RA: 192513806
Maria Eduarda - RA: 192513565
Danilo Sales - RA: 192513669
Anna Cristina - RA: 192620708

- alguns apps e tecnologias para uso:
Docker
Dbeaver
Node.js
No vs code a extensão “Extension Pack from Java”


passos:

1. rodar no terminal do docker:

docker run --name academia_certa -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=academia_certa -p 5434:5432 -d postgres:latest

2. conexão no dbeaver

Host: localhost

Port: 5434

Database: academia_certa

Username: postgres

Password: admin



Como Rodar e Testar no VS Code:
- Abra a pasta backend no VS Code.
- Abra o arquivo AcademiaServerApplication.java e clique em Run (acima do public static void main) ou pressione F5
- Você verá no terminal do VS Code: Tomcat started on port 5120 (http).   
- Inicie o seu front-end React (npm run dev).




