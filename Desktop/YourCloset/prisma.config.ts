// Configuración de Prisma 7 — YourCloset
// Carga .env.local explícitamente (Next.js usa .env.local, dotenv por defecto lee .env)
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    directUrl: process.env["DIRECT_URL"],
  },
});
