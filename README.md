This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started - For developers

To work on this project efficiently, please make sure you have the following:
**VS Code extensions:**

- [ESLint](vscode:extension/dbaeumer.vscode-eslint)
- [Prettier](vscode:extension/esbenp.prettier-vscode) - and set as a default formatter.

These extensions ensure consistent code formatting and linting across the team.

#### ⚠️ Environment Variables

You will need a valid `.env` file to run the project.
Please reqest it before continuing.

### 1. Start the PostgreSQL database

```bash
docker compose up --build -d
```

### 2. Install dependencies

```bash
npm i
```

### 3. Push schema to database

```bash
npx prisma db push
```

### 4. Generate the Prisma client

```bash
npx prisma generate
```

### 5. Run app in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
