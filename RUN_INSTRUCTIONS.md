# Run and Deploy Instructions

Local development steps:

```bash
cd server
npm install
cp .env.example .env
# ensure Postgres is running and DATABASE_URL in .env points to it
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

To add the Git remote and push your code (replace with your credentials):

```bash
git remote add origin https://github.com/harry-sandhu/paisainminutes.git
git branch -M main
git add .
git commit -m "chore: add server scaffold and mocks"
git push -u origin main
```

If your CI requires a different branch or protected branch rules, adjust accordingly.
