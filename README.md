# DeliFast Web

Aplicación web de **DeliFast** para los negocios, los repartidores y el administrador.
Los clientes usan la app móvil (repositorio `DeliFast_App`).

| Zona | Usuarios | Contenido |
|---|---|---|
| `/negocio` | Dueño y empleados del negocio | Pedidos en tiempo real, carta, repartidores, incidencias, estadísticas |
| `/repartidor` | Repartidores (vista móvil, PWA) | Pedidos listos, repartos en curso, entrega y cobro |
| `/admin` | Administrador | Alta y gestión de negocios, incidencias, resumen |

## Tecnologías

- Next.js 16 (App Router) con React 19 y TypeScript
- Tailwind CSS 4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) para inicio de sesión y tiempo real
- API REST propia (`DeliFast_Backend`) para todas las operaciones que cambian datos

## Puesta en marcha

Requisitos: Node.js 20.9 o superior.

```bash
cp .env.example .env.local   # y rellena las variables
npm install
npm run dev                  # http://localhost:3000
```

Para que la web tenga datos, el backend debe estar arrancado (ver `DeliFast_Backend`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── app/
│   ├── page.tsx        inicio (provisional)
│   ├── negocio/        panel del negocio
│   ├── repartidor/     vista del repartidor
│   └── admin/          administración
├── components/         componentes reutilizables
└── lib/
    ├── api.ts          cliente de la API REST
    └── supabase/       cliente de Supabase (login y Realtime)
```

## Despliegue

Vercel, con despliegue automático en cada *push* a `main`.

## Autor

Carlos Morán · Proyecto final del CFGS Desarrollo de Aplicaciones Multiplataforma.
