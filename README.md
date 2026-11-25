# Bolsillo · Gastos e ingresos

App web (instalable en el celular como PWA) para llevar tus ingresos y gastos del mes,
clasificados en **necesarios**, **hormiga** e **innecesarios**, con gráficas.

- **Inicio:** ingresos, gastos, ahorro y dinero disponible; dona por categoría; barra
  necesario/hormiga/innecesario; ingresos vs gastos de 6 meses; dinero disponible por
  mes; salud financiera (regla 50/30/20); presupuestos, suscripciones y gastos más grandes.
- **Movimientos:** lista por día con filtros y búsqueda, edición y exportación a CSV.
- **Presupuestos:** límite mensual por categoría con avisos de "cerca del límite" o "excedido".
- **Ahorro:** metas con anillos de progreso y crecimiento de ahorro + inversión.
- **Suscripciones:** pagos que se repiten cada mes (Netflix, gimnasio, IA, renta…), costo
  mensual y anual, y botón para copiarlos al mes nuevo.
- **Ajustes:** perfil, tema claro/oscuro, categorías propias y la vista previa de Premium.

Stack: Next.js 16 · React 19 · Tailwind CSS 4 · Recharts · Supabase (Auth + Postgres con RLS) · Vercel.

---

## 1. Probarla en tu PC

```powershell
npm install
npm run dev
```

Abre http://localhost:3000. Si no hay claves de Supabase, la app arranca en **modo demo**:
todo se guarda en tu navegador y puedes pulsar "Cargar datos de ejemplo".

Otros comandos: `npm test` (tests de los cálculos), `npm run lint`, `npm run typecheck`, `npm run build`.

## 2. Conectar la nube (Supabase, gratis)

1. Crea una cuenta en https://supabase.com y un proyecto nuevo (elige una región cercana, p. ej. `us-east`).
2. En **SQL Editor**, pega y ejecuta en orden:
   - `supabase/migrations/0001_init.sql` (tablas, seguridad por usuario)
   - `supabase/migrations/0002_seed.sql` (categorías incluidas)
3. En **Project Settings → API** copia la *Project URL* y la *anon public key*.
4. Copia `.env.example` como `.env.local` y pega los dos valores.
5. En **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (luego cámbiala por tu dominio de Vercel)
   - *Redirect URLs*: agrega `http://localhost:3000/auth/callback` y `https://TU-APP.vercel.app/auth/callback`
6. Reinicia `npm run dev`. Ahora verás la pantalla de inicio de sesión y cada usuario tendrá sus propios datos.

### Login con Google

1. En https://console.cloud.google.com crea un proyecto → **APIs y servicios → Credenciales →
   Crear credenciales → ID de cliente de OAuth** (tipo *Aplicación web*).
2. En *URIs de redireccionamiento autorizados* pega la URL que muestra Supabase en
   **Authentication → Providers → Google** (termina en `/auth/v1/callback`).
3. Copia el *Client ID* y *Client Secret* en ese mismo panel de Supabase y activa Google.

El login con correo y contraseña ya viene activo. Supabase envía el correo de confirmación;
puedes desactivar la confirmación en **Authentication → Providers → Email** si lo prefieres.

## 3. Publicarla (Vercel, gratis)

1. Sube este proyecto a un repositorio de GitHub.
2. En https://vercel.com → **Add New → Project** → importa el repositorio (detecta Next.js solo).
3. En **Environment Variables** agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Deploy.** Después actualiza la *Site URL* y las *Redirect URLs* de Supabase con tu dominio de Vercel.

En el celular, abre la URL y usa "Agregar a pantalla de inicio" para instalarla como app.

---

## Estructura

```
src/
  app/(app)/          Pantallas privadas: inicio, movimientos, presupuestos, ahorro, suscripciones, ajustes
  app/(auth)/         Login, registro y recuperación de contraseña
  app/auth/callback   Retorno de Google y de los enlaces de correo
  app/icons/[size]    Íconos PNG de la PWA
  components/charts/  Dona, barras, tendencia, medidor de salud, anillos
  components/providers/finance-provider.tsx   Estado de la app y operaciones
  lib/finance.ts      Cálculos (resúmenes, salud financiera, presupuestos, recurrentes) + tests
  lib/categories.ts   Categorías, grupos, colores y clasificación por defecto
  lib/repo/           Capa de datos: Supabase (nube) o navegador (modo demo)
  lib/features.ts     Catálogo de funciones free/premium
  proxy.ts            Protege las rutas y refresca la sesión
supabase/migrations/  Esquema SQL, políticas RLS y categorías incluidas
```

### Seguridad
Cada tabla tiene Row Level Security: un usuario solo puede leer y escribir sus propios
registros. La columna `profiles.plan` no se puede cambiar desde el navegador (lo bloquea un trigger).

### Premium (preparado, aún sin cobro)
`profiles.plan` (`free` | `premium`) y `hasFeature(plan, 'feature')` en `src/lib/features.ts`
permiten activar funciones de pago más adelante (reportes PDF, cuentas compartidas,
recordatorios, consejos con IA, importar estados de cuenta, varias monedas).

### Colores
La paleta de categorías y de la clasificación se validó para daltonismo en modo claro y
oscuro. Si cambias colores en `src/app/globals.css`, mantén el orden de los grupos en
`src/lib/categories.ts`.
