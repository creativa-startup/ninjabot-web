# 🥷 Ninjabot — Reporte Técnico del Estado del Proyecto

**Fecha de auditoría:** 8 Marzo 2026  
**Proyecto Supabase:** `qyudscnbmdgaghsiunga (Ninjabot)`  
**Commit base:** `775d33f9576cdf46909dfc2250a7184bb5d6bb13`  
**Estado del Sandbox:** ✅ Estable  
**Estado de Producción:** 🟡 En blindaje (Fase 1 aplicada)

---

## 📊 Resumen Ejecutivo (Semáforo de Prioridad)

| Dimensión | Semáforo | Estado |
|---|---|---|
| 1. Navegación N1–N4 Responsive | 🟢 | Verificado — 1 interacción PC vs 2 interacciones Móvil |
| 2. Interacciones y Mock Data | 🟢 | Verificado — Skeletons, Feed Ninja, Stories, Modales |
| 3. Nuevas Prototipaciones | 🟢 | Verificado — Avatar xl, VideoCard, Tienda Express |
| 4. Clases de Materialidad (Capa 1) | 🟢 | Verificado — Familia glass-card + tokens tipográficos |
| 5. Pureza de Componentes (Capa 2) | 🟢 | Verificado — Sin Supabase en componentes ui/ |
| 6. Orquestador Central `ChatsFeature.tsx` | 🟡 | Deuda Técnica — Plan de desacoplamiento en Fase 2 |
| 7. Políticas RLS Tablas Críticas | 🟢 | Verificado — RLS activo + blindaje companies aplicado |
| 8. Seguridad de Credenciales | 🟢 | ✅ Resuelto — Vault cifra tokens (Fase 1) |
| 9. Triggers y Duplicidad | 🟢 | Verificado — Trigger en BD, frontend limpio |

---

## 1. 🧭 Navegación N1–N4 — 🟢 Listo y Verificado

### Experiencia Responsive: "1 interacción PC vs 2 interacciones Móvil"

| Requisito | Cumplimiento | Evidencia |
|---|---|---|
| **Móvil = 2 interacciones** | ✅ | `LayoutDemo.tsx` (L70–71): `mobileView: 'list' | 'detail' | 'context'`. Clic en item → `setMobileView('detail')` (1ª) · Clic en "Historial" → `setMobileView('context')` (2ª). N2 se oculta (`hidden md:flex` L401) y N3 toma 100%. |
| **Desktop = 1 interacción** | ✅ | `md:w-[360px] lg:w-[400px]` (L395): N2 + N3 visibles simultáneamente; N4 es overlay `absolute inset-0` sobre N3. |
| **Layout Decoupling** | ✅ | `ChatDemoN2ListPanel` y `ChatDemoN3DetailPanel` son presenters puros (solo props + callbacks). |
| **Modo Ninja responsive** | ✅ | `ChatsFeature.tsx` L409: `nav.feedNinjaActive || nav.selectedChatId !== null ? 'hidden md:flex' : 'flex'` — móvil hereda 100% de ancho. |

---

## 2. ⚡ Interacciones y Mock Data — 🟢 Listo y Verificado

| Flujo | Estado | Evidencia |
|---|---|---|
| **Skeletons de carga** | ✅ | `ChatN2Skeleton.tsx` (38 líneas) — `animate-pulse` con 6 líneas placeholder. |
| **Toggle Feed Ninja (Zap)** | ✅ | `LayoutDemo.tsx` L117–131 — reset defensivo de N4/burbuja/story. Título dinámico "El ritmo del Jazs" vs "Empieza con un Jazs". |
| **Visor de Historias** | ✅ | `ChatDemoN2ListPanel` L297–365 — overlay inmersivo `bg-[#0a0a0f]/90 backdrop-blur-2xl` con barra segmentada, reacciones y responder. |
| **Burbuja de Notas IA + Modales** | ✅ | `ChatDemoN3DetailPanel` L362–441 — burbuja con `isSavingNote` + spinner; panel N4 con highlight "Recién guardada". |
| **Mock Data completo** | ✅ | `src/demo/chats/mockChats.ts` — `CHAT_CARDS`, `FILTER_ITEMS`, `STATUS_ITEMS`, `CHANNEL_ICONS`, `DEMO_MESSAGES`, `DEMO_NOTES`, `TRENDS`, `CREATORS`, `JAZS_POSTS`. |

---

## 3. 🎬 Nuevas Prototipaciones — 🟢 Verificado (bug visual corregido)

| Prototipo | Estado | Detalle |
|---|---|---|
| `<Avatar size="xl" />` para historias | ✅ | `Avatar.tsx` L41: `xl: 'w-14 h-14 text-lg border-2'`. Integrado con anillo degradado en `ChatDemoN3DetailPanel` L199–206 y `FeedNinjaDetail.tsx`. |
| `VideoCard` con "Modo Teatro" | ✅ | `VideoCard.tsx` L172: `fixed md:absolute inset-0 z-30 bg-black/95` — expansión adaptativa (fullscreen móvil / panel N3 desktop). Hover preview con mute + controles nativos al expandir. |
| **Tienda Express integrada** | ✅ | `ProfilesN3DetailPanel.tsx` — tabs Feed ↔ Store con `ProductCard` (6 productos) y grid de `VideoCard` (1 móvil / 3 desktop). |
| ✅ **Fix: `authorAvatar: 'MN'`** | ✅ | Corregido en `ProfilesN3DetailPanel.tsx` (lines 99 y 108): `authorAvatar: undefined` — ahora `<Avatar />` activa fallback de iniciales en vez de `<img src="MN">`. |

---

## 4. 🎨 Clases de Materialidad (Capa 1) — 🟢 Verificado

Tokens globales definidos en `src/index.css`:

| Token | Definición |
|---|---|
| `glass-card-light` / `glass-card-dark` | ✅ Superficie principal `bg-white/80 backdrop-blur-md border-black/5` / `bg-[#12121a]/80` |
| `glass-subtle-light` / `glass-subtle-dark` | ✅ Paneles internos ultra-translúcidos |
| `glass-chip-light` / `glass-chip-dark` | ✅ Chips/badges/filtros |
| `.text-title` | ✅ `text-sm font-medium text-gray-900/90` |
| `.text-secondary` | ✅ `text-xs text-gray-500/80` |
| `.text-body` / `.text-meta` / `.text-caption` | ✅ Jerarquía tipográfica completa |
| `hover-lift` / `active-press` / `fab-raised` | ✅ Microinteracciones |

**Nota:** La clase `.glass-panel` no existe como alias — la nomenclatura oficial del sistema es `glass-card-*` / `glass-subtle-*` / `glass-chip-*`.

---

## 5. 🧩 Pureza de Componentes (Capa 2) — 🟢 Verificado

| Componente | Impurezas (Supabase/red) | Export público |
|---|---|---|
| `Avatar.tsx` | ✅ Ninguna | ✅ `AvatarSize`, `AvatarProps`, `Avatar` |
| `Badge.tsx` | ✅ Ninguna | ✅ `BadgeCromaticType`, `Badge` |
| `SourceBadge.tsx` | ✅ Solo tipo `AuthSource` (sin runtime) | ✅ `SourceBadgeVariant`, `SourceBadgeProps` |
| `VideoCard.tsx` | ✅ Ninguna (usa `Avatar` interno) | ✅ `VideoCardProps` |
| Paneles `ChatN2ListPanel`, `ChatN3DetailPanel`, `ChatN4SubDetailPanel` | ✅ Cero referencias a Supabase (regex: 0 resultados) | ✅ 100% presenters |

---

## 6. 🏗️ Orquestador Central `ChatsFeature.tsx` — 🟡 Deuda Técnica (Fase 2)

**523 líneas** — centraliza demasiadas responsabilidades:

| Responsabilidad | Líneas aprox. |
|---|---|
| Navegación N2/N3/N4 (`NavigationState`) | L272–281 |
| Datos BD (`useChatsData` + Supabase) | L116–145 |
| Posts + feed (`fetchPosts`, `fetchPostsByUser`) | L150–181 |
| Perfil Ninjat `/@handle` (routing) | L183–232 |
| Entidad activa / `auth_source` (perfil y login) | L239–270 |

### Plan de desacoplamiento (Fase 2)

1. **`useNavigationState`** — extraer `NavigationState`, `handleSelectContact`, `handleOpenN4*`, `handleCloseN3/N4`, `handleSetSearchQuery`.
2. **`usePostsFeed`** — extraer `localPosts`, `activeHashtag`, `fetchPosts`, `filteredPosts`, `handleRefreshFeed`.
3. **`useNinjatProfile`** — extraer `routeHandle`, `ninjatProfile`, `ninjatPosts`, `isLoadingNinjat`.
4. **`useActiveEntity`** — extraer `activeEntity`, `handleEntityChange`, lectura de `auth_source`.

Resultado esperado: `ChatsFeature.tsx` de 523 → ~150 líneas (solo composición de hooks + render).

---

## 7. 🔒 Blindaje RLS en Tablas Críticas — 🟢 Verificado y Aplicado (Fase 1)

### 7.1 RLS habilitado en las 5 tablas críticas

| Tabla | RLS | Política SELECT | Aislamiento tenant |
|---|---|---|---|
| `profiles` | ✅ | `profiles_select_self_or_company` | ✅ `auth.uid() = id OR company_id = internal.get_company_id()` |
| `whatsapp_config` | ✅ | `whatsapp_config_select_self_or_company` | ✅ `user_id = auth.uid() OR company_id = internal.get_company_id()` |
| `agente_config` | ✅ | `agente_config_select_own` | ✅ `user_id = auth.uid()` |
| `notifications` | ✅ | `notifications_select_own` | ✅ `user_id = auth.uid()` |
| `conversation_notes` | ✅ | `conversation_notes_select_self_or_company` | ✅ subquery a `conversations` por tenant |

### 7.2 🛡️ Blindaje aplicado a la tabla `companies` (Fase 1 — resuelto)

| Política anterior (vulnerable) | Política nueva (segura) |
|---|---|
| `empresas_insert_policy` → `WITH CHECK (true)` 🔴 | ✅ `WITH CHECK (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))` |
| `empresas_select_policy` → permitía `auth.uid() IS NULL` | ✅ `USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()))` |

### 7.3 RPC de Bootstrap (dilema "Huevo y Gallina")

Nueva función `create_company_with_admin(p_company_name TEXT, p_company_id UUID DEFAULT gen_random_uuid())`:
- `SECURITY DEFINER SET search_path = public`
- Inserta la empresa y vincula el perfil del usuario autenticado en una transacción atómica
- `REVOKE EXECUTE FROM public, anon` — solo `authenticated`

---

## 8. 🔐 Seguridad de Credenciales — 🟢 Resuelto (Fase 1)

### Antes (vulnerabilidad crítica) 🔴

```sql
whatsapp_config.access_token      TEXT NOT NULL  -- token Meta en texto plano
whatsapp_config.verify_token      TEXT NOT NULL  -- token Webhook en texto plano
whatsapp_config.page_access_token TEXT           -- token Facebook en texto plano
whatsapp_config.webhook_verify_token TEXT        -- token Webhook adicional
```

### Después (blindado con Supabase Vault) 🟢

| Cambio | Estado |
|---|---|
| Columnas `access_token` / `verify_token` ahora `NULL` permitido | ✅ |
| Columnas FK: `access_token_secret_id`, `verify_token_secret_id`, `page_access_token_secret_id`, `webhook_verify_token_secret_id` → `REFERENCES vault.secrets(id) ON DELETE SET NULL` | ✅ |
| Trigger `trigger_encrypt_whatsapp_config_tokens` — intercepta, cifra en Vault, asigna FK, vacía texto plano | ✅ `SET search_path = public, vault` |
| Función RPC `get_decrypted_whatsapp_config(p_user_id UUID)` — lectura descifrada controlada multi-tenant | ✅ `SECURITY DEFINER SET search_path = public, vault` |
| Incluye `webhook_verify_token` en `RETURNS TABLE` | ✅ |
| Tokens legados limpiados a `NULL` (verificado: 0 filas con tokens no-nulos) | ✅ |
| `REVOKE EXECUTE` del trigger para `public, anon, authenticated` | ✅ |

---

## 9. ⚙️ Triggers y Duplicidad — 🟢 Verificado

| Verificación | Estado | Evidencia |
|---|---|---|
| `trigger_update_last_message` existe | ✅ | `AFTER INSERT ON public.messages → update_conversation_last_message()` |
| `search_path` fijado | ✅ | `SET search_path = public` |
| **Carga duplicada removida en frontend** | ✅ | `chatService.ts` L379–381: "El frontend no debe calcular estados derivados" — Realtime sincroniza |
| Trigger `handle_new_user()` con `search_path` | ✅ | `SET search_path = public` (Fase 1 aplicado — elimina WARN del advisor) |
| Trigger `encrypt_whatsapp_config_tokens` | ✅ | `SET search_path = public, vault` (Fase 1 aplicado) |

---

## ✅ Validaciones post-Fase 1 (Resultados reales)

| Validación | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ **0 errores** |
| Políticas `companies` | ✅ `WITH CHECK (true)` eliminado — política segura aplicada |
| Tokens `whatsapp_config` | ✅ 0 filas con `access_token`/`verify_token`/`page_access_token`/`webhook_verify_token` no-nulos |
| Trigger `encrypt_whatsapp_config_tokens` | ✅ `REVOKE` para `anon`/`authenticated` — solo `postgres` lo ejecuta |
| `supabase_vault` extensión | ✅ Habilitada |
| `create_company_with_admin` | ✅ Creada (solo `authenticated`) |
| `get_decrypted_whatsapp_config` | ✅ Creada (solo `authenticated`) |

---

## 📋 Deudas Técnicas Restantes para Fase 2

1. **Desacoplar `ChatsFeature.tsx`** en 4 hooks: `useNavigationState`, `usePostsFeed`, `useNinjatProfile`, `useActiveEntity`.
2. **Habilitar Leaked Password Protection** en Supabase Auth (advisory pendiente).
3. **Decidir alias `.glass-panel`** o documentar `glass-card-*` como oficial.
4. **Rotar tokens en Meta Developers** (manual del Administrador) — los tokens legados fueron vaciados físicamente; la reinstalación de la integración debe llamar al RPC `get_decrypted_whatsapp_config`.
5. **Implementar llamada real a Meta Cloud API** en `whatsappService.ts` (actualmente simulación).

---

*Documento generado automáticamente tras auditoría del codebase + verificación de base de datos en vivo.*