This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cotizaciones

El panel incorpora `/panel/quotes` (estados, cliente, fechas del evento y paginación)
y `/panel/quotes/[id]` (detalle, importes congelados, observaciones y pagos relacionados).
Requiere `ENCARGADO` o `SUPERADMIN` y consume la API real mediante `NEXT_PUBLIC_API_URL`.
Las fechas del evento y los vencimientos se muestran en hora de Lima.

El backend debe incluir los casos reales de la spec 08 y la migración
`0006_quote_observations`. Este módulo consulta `GET /quotes` y `GET /quotes/{id}`;
las acciones de adelanto y cancelación se integrarán con la entrega de Christian.

Validación: `npm run lint`, `npx tsc --noEmit` y `npm run build`.
