# Plan de Autenticación con Supabase

## 1. Crear proyecto en Supabase
- Regístrate en https://supabase.com/ y crea un nuevo proyecto.
- Anota `SUPABASE_URL` y `SUPABASE_ANON_KEY` (ver instrucciones abajo).

## 2. Configurar proveedores OAuth
- En la consola de Supabase: Auth → Settings → External OAuth Providers.
- Habilita Google y Facebook. Añade Client ID/Secret (de Google/Facebook Developers).

## 3. Instalar dependencias
- Ejecuta: `npm install @supabase/supabase-js`
- Añade `.env` con `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

## 4. Inicializar cliente Supabase
- Crea `src/lib/supabaseClient.ts` exportando el cliente configurado.

## 5. Contexto de autenticación
- Implementa un AuthProvider (React Context) para manejar sesión y métodos de login/registro/logout.

## 6. UI de registro/login
- Formulario de email/password.
- Botones para Google y Facebook.

## 7. Protección de rutas
- Hook/HOC para redirigir si no hay sesión.

## 8. Modelar resultados en la base de datos
- Tabla `game_results` con `id`, `user_id`, `score`, `created_at`.
- Políticas RLS: sólo el owner accede a sus datos.

## 9. Guardar resultados
- Al terminar el juego, guardar en `game_results` con el `user_id` del usuario autenticado.

## 10. Mostrar resultados
- Página de perfil/ranking mostrando los resultados del usuario o globales.

## 11. Pruebas y ajustes
- Probar todos los flujos y manejo de errores.

## 12. Despliegue
- Variables de entorno en el hosting y revisión de seguridad.

---

### ¿Dónde encontrar los datos de Supabase (`SUPABASE_URL` y `SUPABASE_ANON_KEY`)?

1. Accede a tu proyecto en https://supabase.com/.
2. En el panel izquierdo, ve a **Project Settings** (icono de engranaje).
3. Haz clic en **API**.
4. Ahí verás:
   - **Project URL** → este es tu `SUPABASE_URL`.
   - **anon public** → este es tu `SUPABASE_ANON_KEY`.
5. Copia ambos valores y pégalos en tu archivo `.env`.

¿Quieres que te guíe para crear el archivo `supabaseClient.ts` y seguir con la integración?
