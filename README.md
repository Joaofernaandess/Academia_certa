# Academia Certa

Sistema de gestão de academias com frontend React e API Java/Spring Boot.

## Ver as telas sem login (modo demonstração)

Para navegar pelas telas sem configurar banco de dados ou entrar com uma conta:

1. Instale o Node.js (20.19+ ou 22.12+) e abra um terminal na pasta `frontend`.
2. Instale as dependências e inicie o frontend:

   ```powershell
   npm install
   npm run dev
   ```

3. Abra `http://localhost:5173` e clique em **Ver telas de demonstração** na tela
   de login.

O modo demonstração mostra as telas de início, alunos, planos, instrutores,
pagamentos e perfil com dados fictícios. É uma prévia local do frontend: não
acessa nem grava dados no backend ou no banco, e as alterações feitas na prévia
se perdem ao recarregar a página. O botão só aparece durante `npm run dev`.

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

O modo demonstração serve para conhecer a interface sem login; cadastros reais e
persistência de dados exigem o backend, o banco e uma conta válida.
