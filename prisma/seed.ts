import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@taskflow.app" },
    update: { name: "Usuario Demo", passwordHash },
    create: { name: "Usuario Demo", email: "demo@taskflow.app", passwordHash },
  });

  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany({ where: { ownerId: user.id } });

  const board = await prisma.board.create({
    data: { title: "Lanzamiento de TaskFlow", ownerId: user.id },
  });

  const pendiente = await prisma.column.create({
    data: { title: "Pendiente", boardId: board.id, position: 0 },
  });
  const progreso = await prisma.column.create({
    data: { title: "En progreso", boardId: board.id, position: 1 },
  });
  const hecho = await prisma.column.create({
    data: { title: "Hecho", boardId: board.id, position: 2 },
  });

  await prisma.task.createMany({
    data: [
      { title: "Definir historias de usuario", columnId: pendiente.id, position: 0 },
      { title: "Configurar Prisma y SQLite", columnId: pendiente.id, position: 1 },
      { title: "Diseñar el esquema de la base de datos", columnId: pendiente.id, position: 2 },
      { title: "Implementar autenticación", columnId: progreso.id, position: 0 },
      { title: "Construir el tablero Kanban", columnId: progreso.id, position: 1 },
      { title: "Escribir tests con Vitest y Playwright", columnId: hecho.id, position: 0 },
      { title: "Desplegar en Vercel", columnId: hecho.id, position: 1 },
    ],
  });

  console.log("✅ Seed completado. Usuario demo: demo@taskflow.app / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
