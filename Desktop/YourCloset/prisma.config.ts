// Configuración de Prisma 7 — YourCloset
// Las URLs de conexión van aquí (no en schema.prisma)
import "dotenv/config";
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
