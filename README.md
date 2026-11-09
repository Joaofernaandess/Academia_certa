# Academia Certa

Sistema de gestão de academias com frontend React e API Java/Spring Boot.

## Rodar o sistema completo localmente

Requisitos: Node.js, Java JDK 25, Maven e MySQL 8. O backend usa MySQL na porta
`3306` e disponibiliza a API em `http://localhost:5120`.

1. No DBeaver, conecte ao MySQL com um usuário que possa criar o banco e execute
   [`backend/src/main/resources/db/mysql/schema.sql`](backend/src/main/resources/db/mysql/schema.sql).
   Se a tabela `unidade_organizacional` já existia antes do suporte a logos,
   execute também uma vez
   [`backend/src/main/resources/db/mysql/migration_organization_logo.sql`](backend/src/main/resources/db/mysql/migration_organization_logo.sql).
2. Copie `backend/.env.local.properties.example` para
   `backend/.env.local.properties` e informe usuário, senha e uma chave JWT
   privada. O arquivo real é ignorado pelo Git; não publique suas credenciais.
   Para gerar uma chave aleatória no PowerShell:

   ```powershell
   $bytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```

3. Inicie o backend em um terminal:

   ```powershell
   cd backend
   mvn spring-boot:run "-Dspring-boot.run.profiles=mysql"
   ```

4. Em outro terminal, inicie o frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Abra `http://localhost:5173`, cadastre a academia e uma conta para entrar no
   sistema. O cadastro de alunos, planos, instrutores e pagamentos fica no menu.

O acesso às telas internas e a persistência de dados exigem o backend, o banco e
uma conta válida.
