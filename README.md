# DeliFast Web

Aplicación web de **DeliFast** para los negocios, los repartidores y el administrador.
Los clientes usan la app móvil (repositorio `DeliFast_App`).

| Zona | Usuarios | Contenido |
|---|---|---|
| `/admin` | Administrador | Resumen, alta y suspensión de negocios, incidencias (**hecho**) |
| `/negocio` | Dueño y empleados del negocio | Pedidos en tiempo real, carta, repartidores, incidencias, estadísticas (*pendiente*) |
| `/repartidor` | Repartidores (vista móvil, PWA) | Mis pedidos, entrega y cobro, perfil (*pendiente*) |

`/login` es común: tras iniciar sesión, cada usuario va a su zona según el rol de su token.

## Tecnologías

- Next.js 16 (App Router) con React 19 y TypeScript
- Tailwind CSS 4, con los colores y estilos de texto de Figma como tokens (`src/app/globals.css`)
- `openapi-fetch` + `openapi-typescript` para el cliente tipado de la API
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) para inicio de sesión y tiempo real
- API REST propia (`DeliFast_Backend`) para todas las operaciones que cambian datos

## Puesta en marcha

Requisitos: Node.js 20.9 o superior.

```bash
cp .env.example .env.local   # y rellena las variables
npm install
npm run dev                  # http://localhost:3000
```

### Modos de desarrollo

| Variable | `true` | `false` |
|---|---|---|
| `NEXT_PUBLIC_API_MOCK` | Un simulador en el navegador responde con datos de ejemplo, cumpliendo el contrato de la API | Llama a la API real en `NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_AUTH_MOCK` | Sesión fija de administrador, sin Supabase (solo desarrollo) | Login con Supabase Auth |

Con los dos a `true` la web funciona sin backend ni Supabase. Para usar el backend real, pon
`NEXT_PUBLIC_API_MOCK=false` y arranca `DeliFast_Backend`. Una banda amarilla avisa cuando hay algo simulado.

## Contrato de la API

`docs/api/openapi.yaml` (OpenAPI 3.1) es el contrato entre la web y el backend, y hay una copia en
`DeliFast_Backend/docs/api/openapi.yaml`. Si cambia:

1. Edita `docs/api/openapi.yaml` y cópialo al backend.
2. `npm run api:types` regenera `src/lib/api/schema.d.ts`. El cliente (`src/lib/api/client.ts`, con
   `openapi-fetch`) queda tipado con él: una ruta o un campo que no esté en el contrato no compila.
3. Actualiza el simulador (`src/lib/api/mock`) para que siga respondiendo igual que el backend.

Los errores siguen ProblemDetail (RFC 9457), como el `GlobalExceptionHandler` del backend.

## Inicio de sesión y roles

- `src/proxy.ts` (el antiguo *middleware* de Next.js) refresca la sesión de Supabase en cada petición
  y redirige: sin sesión a `/login`; con sesión, cada rol solo entra en su zona.
- El rol se lee del claim `user_rol` del JWT, que añade `custom_access_token_hook` (migración V1 del
  backend) desde `perfiles`. Si el hook aún no está activado, se usa `app_metadata.rol`. Nunca `user_metadata`.
- La API vuelve a comprobar el rol en cada petición; la web solo evita mostrar lo que no toca.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | ESLint |
| `npm run api:types` | Regenera los tipos de la API desde `docs/api/openapi.yaml` |

## Estructura

```
docs/api/openapi.yaml       contrato de la API
public/iconos/              iconos SVG exportados de Figma
src/
├── proxy.ts                sesión y acceso por rol
├── app/
│   ├── login/              W00 inicio de sesión
│   ├── admin/              A01 resumen, A02 negocios (+ A03 alta), A04 incidencias
│   ├── negocio/            panel del negocio (pendiente)
│   └── repartidor/         vista del repartidor (pendiente)
├── components/
│   ├── ui/                 componentes del sistema de diseño (botón, chip, interruptor, modal…)
│   └── admin/              pantallas y piezas de la zona de administración
└── lib/
    ├── api/                cliente tipado, tipos generados y simulador (mock/)
    ├── auth/               roles y cierre de sesión
    ├── supabase/           clientes de Supabase (navegador y proxy)
    └── config.ts           variables de entorno
```

## Despliegue

Vercel, con despliegue automático en cada *push* a `main`.

## Autor

Carlos Morán · Proyecto final del CFGS Desarrollo de Aplicaciones Multiplataforma.
