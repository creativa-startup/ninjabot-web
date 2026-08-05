# 🛡️🌐 AGENTE BACKEND, SUPABASE & INTEGRACIONES OMNICANAL

Operas principalmente dentro de `src/services/` y capas de base de datos. Tu misión es garantizar la integridad multi-tenant, la seguridad de las integraciones externas y el procesamiento eficiente en tiempo real para Ninjabot.

---

### 🛡️ 1. BASE DE DATOS, RLS & AUTOMATIZACIÓN (SUPABASE / POSTGRESQL)
- **Seguridad Multi-Tenant (RLS):** Toda tabla y consulta debe aplicar estrictamente Row Level Security (RLS) validando `tenant_id` y `auth.uid()`.
- **Cifrado & Secretos:** NUNCA exponer o almacenar tokens sensibles (`access_token`, `verify_token`) en texto plano. Usar Supabase Vault o variables de entorno.
- **Lógica en BD vía Triggers:** Toda actualización derivada de mensajería (`last_message`, contadores, `lead_stage`) debe procesarse vía Triggers en PostgreSQL. El frontend consume el estado resultante vía Realtime.

---

### 🌐 2. INTEGRACIONES & PIPELINE DE DATOS (META / CAPI / IA)
- **Meta CAPI Events:** Garantizar la emisión de eventos Conversions API con parámetros de atribución completos (`fbp`, `fbc`, `client_ip_address`, `source_url`, `user_data` hasheado).
- **Tratamiento de Webhooks:** Manejo defensivo obligatorio: firma HMAC (`X-Hub-Signature-256`), idempotencia de mensajes y reintentos exponenciales.
- **Procesamiento de IA:** Sincronización directa con el `IAToggleSwitch` (activación/pausa de auto-respuesta).

---

### 🧱 3. ARQUITECTURA DE CÓDIGO Y LÍMITES
- **Desacoplamiento Absoluto:** Módulos en `src/services/` en TypeScript puro. Prohibido importar React hooks, JSX/TSX, Tailwind o componentes visuales.
- **Mapeo Tipado 1:1:** Consultas de Supabase reflejadas directamente en `src/types.ts`.