# TaskFlow

Gestor de tareas tipo **Kanban** construido con Next.js 16, React 19, TypeScript y Prisma. Aplicación full-stack con autenticación propia (sesiones JWT en cookies httpOnly), CRUD completo de tableros, columnas y tareas, y **drag & drop** nativo entre columnas.

> Proyecto en desarrollo para el portafolio de **Damian Espinosa** ([portafolio](https://github.com/AsherAST/portafolio)).

## ✨ Funcionalidades

- **Autenticación**: registro, inicio de sesión y cierre de sesión con contraseñas hasheadas (bcryptjs) y sesiones JWT firmadas con [jose](https://github.com/panva/jose) en cookies httpOnly.
- **Tableros**: crear y eliminar tableros, cada uno propiedad del usuario (autorización por ownership, 404 si no te pertenece).
- **Columnas**: crear y eliminar columnas dentro de un tablero.
- **Tareas**: crear, editar (título + descripción) y eliminar tareas.
- **Drag & drop**: mover tareas entre columnas y reordenarlas con HTML5 DnD, con indicador visual de posición y actualización optimista.
- **Validación** de entrada con **Zod** en el servidor (API y Server Actions).
- **Bilingüe**: interfaz en español (la de producción se puede adaptar a ES/EN).

## 🛠 Stack

| Área | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 |
| Backend | API Routes (auth) · Server Actions (CRUD) · Node.js |
| Base de datos | Prisma 7 + SQLite (dev) → PostgreSQL/Neon (producción) |
| Seguridad | bcryptjs (hash) · jose (JWT) · cookies httpOnly · Zod |
| Testing | Vitest + Testing Library · Playwright (e2e) |

## 🚀 Demo

- **Sitio en vivo**: _pendiente de deploy_ (se añadirá la URL de Vercel).
- **Repositorio**: <https://github.com/AsherAST/taskflow>

## 📸 Capturas

_Se añadirán capturas de pantalla del tablero, login y listado._

## 🧑‍💻 Cómo correrlo localmente

Requisitos: **Node.js 20+** y npm.

```bash
# 1. Instalar dependencias (postinstall genera el cliente Prisma)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# edita AUTH_SECRET con un secreto aleatorio:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Crear la base de datos (aplica migraciones + seed con datos demo)
npm run db:migrate
npm run db:seed

# 4. Servidor de desarrollo
npm run dev
# → http://localhost:3000
```

Usuario demo del seed: `demo@taskflow.app` / `demo1234`.

## 🧪 Tests

```bash
npm test            # tests unitarios (Vitest)
npm run test:coverage
npm run test:e2e    # tests end-to-end (Playwright, requiere `npm run dev` o lo inicia solo)
```

## 📦 Scripts útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Aplica migraciones de Prisma |
| `npm run db:seed` | Rellena la BD con datos demo |
| `npm run db:studio` | Prisma Studio (explora la BD) |

## 🗂 Estructura relevante

```
src/
├── actions/            # Server Actions (boards, columns, tasks)
├── app/
│   ├── (auth)/         # login / register
│   ├── (app)/          # boards y board kanban (área autenticada)
│   └── api/auth/       # API routes de autenticación
├── components/         # UI (KanbanBoard, ColumnView, TaskCard, AuthForm…)
├── generated/prisma/   # Cliente Prisma generado (no se commitea)
└── lib/                # db, auth (JWT), password, session, validators
prisma/
├── schema.prisma       # Modelos: User, Board, Column, Task
└── seed.ts             # Datos demo
```

## 🧠 Conceptos que demuestra

- Relaciones en base de datos (1:N) y modelado Kanban (el estado de una tarea es su columna).
- Autenticación de cero: hashing (bcryptjs), tokens (jose), cookies httpOnly y protección de rutas.
- Server Actions + revalidación, API Routes y validación con Zod.
- UI optimista con drag & drop nativo (sin librerías).

## 📄 Licencia

Proyecto educativo de portafolio.
