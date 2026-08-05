# 📖 DOCUMENTO MADRE: ESPECIFICACIÓN DE ARQUITECTURA UI/UX & SISTEMA DE NAVEGACIÓN (NINJABOT)

> **Estado del Proyecto:** En desarrollo activo  
> **Última actualización:** 2026-07-31  
> **Fuentes de verdad:** `src/types.ts`, `DOCUMENTO_MADRE.md`

---

## 🏗️ 1. ARCHITECTURE OVERVIEW (N1 - N4)

### Jerarquía Espacial
- **N1 (`[Panel]` Sidebar):** Navegación global del SaaS. No gestionado por `ChatsFeature`.
- **N2 (`[Panel]` List):** Lista de chats / colecciones. Implementado via `ChatN2ListPanel` integrado en `ChatsFeature.tsx`.
- **N3 (`[Panel]` Detail):** Hilo de conversación principal / Espacio de trabajo (`ChatN3DetailPanel`).
- **N4 (`[Panel][Sub]` SubDetail - Focus Overlay):** Overlay de contexto profundo (`ChatN4SubDetailPanel`).

### Responsividad
- **Desktop (1 Interacción):** N2 (280px fijo) y N3 (flex-1) visibles simultáneamente. N4 se superpone sobre N3.
- **Mobile (2 Interacciones):** N2 ocupa 100% al inicio; al seleccionar un chat, N3 conmuta a 100% con botón `←` (solo `md:hidden`) para volver a N2.

### Reglas de Navegación N4 (Focus Overlay)
- N4 funciona SIEMPRE como un **100% Focus Overlay** sobre N3 (`absolute inset-0 z-30 w-full h-full bg-white`). Prohibido alterar el ancho de N2 o desplazar el layout.
- `ChatN4Header` requiere obligatoriamente una acción visible de retorno/cierre (`onBack` / `onClose`) para regresar a N3.
- Dos variantes definidas:
  - `variant='back'`: Muestra `← Volver` — usado desde libreta (📋) / notas.
  - `variant='close'`: Muestra `✕ Cerrar` — usado desde AddTrigger (+).

---

## 🏷️ 2. TAXONOMÍA DE COMPONENTES — INVENTARIO COMPLETO (MÓDULO CHATS)

### Convención de nomenclatura
- `[Layout]`: Contenedores globales (`GlobalHeader`).
- `[Panel]`: Contenedores de nivel (`ChatN2ListPanel`, `ChatN3DetailPanel`, `ChatN4SubDetailPanel`).
- `[Header]`: Encabezados estandarizados por nivel (`ChatN2Header`, `ChatN3Header`, `ChatN4Header`).
- `[List]` / `[Detail]` / `[Sub]`: Cuerpos de contenido internos (`ChatN2List`, `ChatN3MessagesFeed`, `ChatN4Content`).
- `[Control]`: Componentes emisores de interacción (`Control[Entidad]` o `Control[Función]`).
- `[Brand]`: Componentes de identidad de marca reutilizables (`NinjabotLogo` en `src/components/common/`).

### Inventario detallado — `src/features/chats/`

| Componente | Taxonomía | Props (core) | Estado interno | Uso |
|---|---|---|---|---|
| `ChatsFeature` | Orquestador | `contacts`, `notes`, `platformStatus`, callbacks `onSendMessage`, `onToggleAiAgent`, `onChangeLeadStage`, `onAddNote`, `onEditNote`, `onDeleteNote`, `onOpenSaleModal`, `onIntegrateCatalog`, `density` | `NavigationState` via `useState` | ✅ Activo |
| `ChatN2Header` | `[Header]` | `totalConversations: number` | Ninguno | ✅ Activo |
| `ChatN2Filters` | `[Control]` | `searchQuery`, `onSearchChange`, `platformStatus`, `onConnectPlatform`, `onFilterChange`, `activePlatform`, `channelCounts` | Ninguno | ✅ Activo |
| `ChatN2ListPanel` | `[Panel]` | `contacts`, `activeContactId`, `onSelectContact`, `searchQuery`, `onSearchChange`, `activePlatform`, `onPlatformChange`, `platformStatus`, `onConnectPlatform`, `channelCounts` | Ninguno | ✅ **Activo** — integrado en `ChatsFeature.tsx` |
| `ChatN3DetailPanel` | `[Panel]` | `contact`, `tempLevel`, `channel`, `onSendMessage`, `onToggleAiAgent`, `onChangeLeadStage`, `onBackClick`, `showBackArrow`, `onOpenN4Actions`, `onOpenN4Notes`, `onIntegrateCatalog`, `onOpenSaleModal` | `inputText` (local useState) | ✅ Activo |
| `ChatN3Header` | `[Header]` | `contact`, `tempLevel`, `channel`, `showBackArrow`, `onBackClick`, `onToggleAiAgent`, `onIntegrateCatalog` | Ninguno | ✅ Activo |
| `ChatN3MessagesFeed` | `[Detail]` | `contact`, `channel`, `isLoadingAi` | `messagesEndRef` (ref scroll) | ✅ Activo |
| `ChatN4SubDetailPanel` | `[Panel]` | `contact`, `notes`, `onAddNote`, `onEditNote`, `onDeleteNote`, `onBack`, `variant`, `title` | `showHistory`, `editingNoteId`, `editingText` (local useState) | ✅ Activo |
| `ChatN4Header` | `[Header]` | `title`, `onBack`, `variant` ('back'\|'close'), `size` ('sm'\|'md'\|'lg') | Ninguno | ✅ Activo |
| `ChatN4NoteForm` | `[Sub]` | `onSave`, `initialText` | `text` (local useState) | ✅ Activo |
| `ChatN4NotesHistory` | `[Sub]` | `notes`, `onEdit`, `onDelete`, `onEditStart` | Ninguno | ✅ Activo |
| `ControlChat` | `[Control]` | `onOpenNotes`, `onOpenActions` | Ninguno | ✅ Activo |

---

## 🎛️ 3. CLASIFICACIÓN DE CONTROLES (`Control[Entidad]`)

1. **Agnósticos Globales:** Reutilizables en cualquier módulo (ej. `ControlFilterRrss`).
2. **Hijos de Entidad / Dominio:** Acoplados exclusivamente al ciclo de vida de su entidad padre (ej. `ControlChat`, `ControlContactos`, `ControlPipeline`).

### Controles activos en el módulo Chats

| Control | Taxonomía | Props recibidos | Callbacks emitidos | Pureza |
|---|---|---|---|---|
| `ControlChat` | `[Control]` Hijo de Entidad | `onOpenNotes`, `onOpenActions` | `onOpenNotes()` → abre N4 (variant='back'), `onOpenActions()` → abre N4 (variant='close') | ✅ Puro — sin estado, sin API calls |
| `ControlFilterRrss` | `[Control]` Agnóstico Global | `activeFilter: string`, `onIntegrationClick(network)` | `onIntegrationClick('all' \| 'whatsapp' \| 'instagram' \| 'messenger')` → el orquestador abre la integración | ✅ Puro — sin servicios/APIs/Supabase, estado local `isExpanded` solo de presentación |

### Reglas de pureza aplicadas
- **Headers y Controls** NO gestionan estado local pesado ni realizan llamadas directas a APIs o mutation hooks.
- Reciben datos vía `props` y emiten callbacks (`onToggleN4()`, `onStageChange()`) hacia `ChatsFeature.tsx`.

---

## ⚙️ 4. REGLAS DE ESTADO Y BACKEND

- **Single Source of Truth:** `NavigationState` en el orquestador principal (`ChatsFeature.tsx`). Prohibido fallbacks en vistas secundarias.
  ```typescript
  interface NavigationState {
    selectedChatId: string | null;   // Chat activo (null → N2 visible, N3 oculto)
    n4View: N4View;                  // 'actions' | 'notes' | null (null → N4 oculto)
    platformFilter: PlatformFilter;  // 'all' | 'whatsapp' | 'messenger' | 'instagram' | 'ninjabot'
    searchQuery: string;             // Texto de búsqueda en N2
  }
  ```
- **Sincronización via Database Triggers:** Triggers en PostgreSQL (Supabase) calculan y actualizan en tiempo real estados complejos (`last_message`, contadores de no leídos, `lead_stage`).
- **Strict Typing:** `src/types.ts` es la única fuente de verdad para TypeScript, 1:1 con ENUMs de Postgres.

### ⚠️ Auditoría de incumplimientos detectados

| Regla | Estado | Detalle |
|---|---|---|
| `ChatN2ListPanel` no se usaba en producción | ✅ **Resuelto (Pase 1)** | `ChatsFeature.tsx` ahora usa `ChatN2ListPanel` en lugar de la lista inline. Migración completada. |
| `channel: 'facebook'` vs `MessagingPlatform` | ✅ **Resuelto (Pase 1)** | Todos los mocks y tipos corregidos de `'facebook'` → `'messenger'` en `ChatsFeature.tsx`, `ChatsFeatureSandbox.tsx`, `ChatsFeature.demo.tsx`, `ChannelIcons.tsx` y `DOCUMENTO_MADRE.md`. |
| Fallback a mock data en producción | ⚠️ **Pendiente** | `ChatsFeature` mantiene lógica `useMock = contacts.length === 0` que cae a `MOCK_CHATS`. Se migrará a estado de carga real cuando se integre Supabase. |
| `MOCK_CHATS` duplicado | ⚠️ **Pendiente** | Existe tanto en `ChatsFeature.tsx` como en `ChatsFeatureSandbox.tsx`. Se consolidará en refactor futuro. |

---

## 📜 5. HISTORIAL DE CAMBIOS Y EVOLUCIÓN (CHANGELOG)

### [2026-07-31] - Unificación del Flujo Móvil: ChatN2ListPanel ahora visible en Mobile

- **Bug Resuelto:** `ChatN2ListPanel` NO aparecía en móvil — solo en PC.
- **Causa Raíz:** En `src/components/layout/MainLayout.tsx`, la rama `isMobile` usaba el sistema **legacy** (`ChatListPanel` + `ChatDetailPanel`), mientras que `ChatsFeature` (que integra `ChatN2ListPanel`) solo se renderizaba en la rama `!isMobile` (Desktop).
- **Refactor:** `MainLayout.tsx` — La rama móvil de `activeTab === 'chats'` ahora renderiza `ChatsFeature` (con `Header` + `MobileTabs` encima), igual que Desktop. Se eliminó el uso de `ChatListPanel`/`ChatDetailPanel` legacy en móvil.
  - Sandbox móvil: `ChatsFeature` con `MOCK_CONTACTS`, `MOCK_NOTES`, `MOCK_POSTS`, `MOCK_PLATFORM_STATUS`, `initialActiveEntity="ninjabot"`, `useInternalDataSource={false}`.
  - Producción móvil: `ChatsFeature` con hook interno Supabase (`useChatsData` → `fetchContactsWithConversations`), igual que Desktop. `onOpenSaleModal` conectado al modal global.
- **Corrección Post-Feedback (2 iteraciones):** 
  1. La primera versión usaba `<ChatsFeature />` (hook interno) en móvil producción — el feedback indicó que no funcionaba.
  2. Se probó `ChatsFeature` con `contacts` del estado global de `App.tsx` (`useInternalDataSource={false}`) + wrappers de callbacks, pero `App.tsx` inicia `contacts=[]` y solo los puebla vía `fetchContactos()` (llamado desde `ContactsPanel`), por lo que tampoco mostraba datos al montar.
  3. **Solución final:** producir móvil usa exactamente el mismo `<ChatsFeature />` que Desktop (hook interno Supabase), garantizando paridad de comportamiento y datos reales al montar.
- **Props obsoletas:** `MainLayout` conserva el contrato de props original pero ignora (con alias `_`) los props legacy que ya no se consumen en móvil: `activeContactId`, `activeContact`, `capiActive`, `mobileSubView`, `onMobileSubViewChange`, `searchQuery`, `onSearchQueryChange`, `isLoadingAi`, `onSendMessage`, `onToggleAiAgent`, `onChangeLeadStage`, `platformStatus`, `onConnectPlatform`. Los props `onSendMessage`, `onToggleAiAgent`, `onChangeLeadStage` quedaron obsoletos porque el flujo chat ahora delega en el hook interno (`useChatsData`) de `ChatsFeature`.
- **Comportamiento móvil resultante (alineado con AGENTE_FRONTEND.md):** Mobile muestra N2 (`ChatN2ListPanel`) a 100% al inicio; al seleccionar un chat, N3 conmuta a 100% con botón `←` para volver a N2 (flujo por capas de 2 interacciones). N4 se superpone sobre N3 como Focus Overlay.
- **Corrección de warning de accesibilidad (form fields):** Se agregaron atributos `id` y `name` a los 4 campos de formulario del flujo Chats que se montan/desmontan al navegar N2→N3→N4 en móvil (y que disparaban el warning del navegador *"A form field element has neither an id nor a name attribute"*):
  - `ControlFilterRrss` buscador N2 → `id="chat-search-input"` / `name="chatSearch"`.
  - `ChatN3DetailPanel` input de mensaje N3 → `id="chat-message-input"` / `name="chatMessage"`.
  - `ChatN4NoteForm` textarea de notas N4 → `id="chat-note-textarea"` / `name="chatNote"`.
  - `CreatePostForm` textarea de posts N2 → `id="create-post-textarea"` / `name="createPost"`.
- **Corrección de layout móvil (overflow-hidden en `main.flex`):** El usuario reportó que al pasar a móvil el `main.flex` con `overflow-hidden` recortaba el contenido. Causa raíz: el contenedor principal era SIEMPRE `flex` (fila) mientras que `SidebarN1` en móvil es `w-full h-12 shrink-0` (barra superior ancha). En fila, la barra superior empujaba al `main` fuera del viewport y el `overflow-hidden` del contenedor lo recortaba. Correcciones:
  - Contenedor principal: `flex flex-col md:flex-row` — columna en móvil (SidebarN1 barra superior + contenido debajo), fila en desktop.
  - `<main>`: `min-h-0` en lugar de `h-full` para que el contenido ocupe el espacio restante tras el SidebarN1 (en flex-col, `h-full` forzaba el 100% y desbordaba).
  - Contenedores móviles internos (ChatsFeature y ContactsPanel): `flex-1 min-h-0` en lugar de `h-full` para permitir el scroll interno en la cadena flex.
- **Corrección final de componentes (GlobalHeader/SidebarN1 son los ACTUALES, se elimina el flujo legacy móvil):** Inicialmente se ocultó `GlobalHeader` y `SidebarN1` en móvil pensando que eran legacy, pero el usuario aclaró que esos SON los componentes actuales y que los antiguos eran `Header` + `MobileTabs` (versión móvil vieja). Correcciones finales:
  - `GlobalHeader`: vuelve a renderizarse en TODAS las resoluciones (es el componente actual responsivo).
  - `SidebarN1`: vuelve a renderizarse en TODAS las resoluciones (es responsivo: barra superior en móvil `w-full h-12`, lateral en desktop `md:w-16 md:h-full`).
  - Eliminados del flujo móvil los componentes ANTIGUOS: `Header` y `MobileTabs` (era la versión móvil legacy). La navegación Chats/Contactos ahora la provee `SidebarN1` (barra superior en móvil).
  - `userName`/`avatarUrl` quedaron obsoletos en `MainLayout` (solo los consumía el `Header` antiguo) → alias `_`.
- **Eliminación definitiva de componentes antiguos (Header y MobileTabs):** Tras confirmar que `GlobalHeader` + `SidebarN1` son los componentes actuales, se eliminaron del proyecto los componentes legacy del flujo móvil:
  - Eliminado `src/components/Header.tsx` — header móvil antiguo (solo lo usaba el flujo legacy con `Header` + `MobileTabs`).
  - Eliminado `src/components/MobileTabs.tsx` — tabs móviles antiguos (la navegación Chats/Contactos la provee ahora `SidebarN1` responsivo).
  - Verificado con `search_files`: `Header` y `MobileTabs` ya no tienen NINGÚN import activo en `src/`.
  - `userName`/`avatarUrl` quedan obsoletos en `MainLayoutProps` (eran consumidos por el `Header` antiguo) → alias `_`.
- **Verificado:** `npm run build` exitoso (1891 módulos transformados, PWA v1.3.0 generada, 20 entradas precacheadas).

### [2026-07-31] - Refactor Flujo de Autenticación y PWA → Estilo "Dark Minimalista Borderless"

- **Refactor:** `src/auth/AuthScreen.tsx` (La Puerta, ruta `/auth`) — Componente REAL renderizado por `App.tsx` en el flujo de entrada. Fondo negro puro (`bg-black min-h-screen`), texto blanco. Logo Ninjabot en variante blanca + eslogan exacto **"Mensajería Inteligente"** (`text-neutral-400`). Formulario sin cajas: inputs `bg-transparent` con borde inferior sutil (`border-b border-neutral-700 focus:border-white`). Modo dual Registro (Nombre/Email/Password) ↔ Iniciar sesión (Email/Password) conmutado desde el footer de texto interactivo (`Crear cuenta` / `Iniciar sesión`). Botón principal sólido blanco con texto negro, sin sombras. Social Login: iconos limpios de Google y Facebook (sin botones grandes).
- **Agregado:** `loginConFacebook` en `src/services/supabase.ts` — OAuth de Facebook vía Supabase Auth (`provider: 'facebook'`, redirect a `/app`). `AuthScreen` ya prepara el `onClick` del ícono de Facebook.
- **Ajustado:** `loginConGoogle` ya existía en `src/services/supabase.ts`; conectado al ícono limpio de Google en `AuthScreen`.
- **Refactor:** `src/App.tsx` — Loading screen (pre-auth) actualizado al estilo Dark: fondo negro, spinner blanco (`border-white/20 border-t-white`), texto `text-neutral-500`.
- **Nota:** `src/components/LoginScreen.tsx` (antiguo componente refactorizado con el mismo estilo) quedó como código inactivo — no es importado por ningún módulo activo. El flujo real de entrada es `AuthScreen`.
- **Refactor:** `src/components/power/PowerActivationModal.tsx` (La Activación) — Eliminado contenedor blanco/card. Fondo de pantalla completa con degradado (`bg-gradient-to-b from-black to-neutral-900`). Textos en `text-white` / `text-neutral-300`. Conserva el efecto Typewriter (los mensajes flotan directamente sobre el fondo) y el botón [↓ Descargar] adaptado a bordes y texto blancos (`border-white text-white hover:bg-white hover:text-black`). Logo en variante blanca.
- **Refactor:** `src/components/power/PwaReminderScreen.tsx` (El Recordatorio) — Eliminada la tarjeta blanca. Fondo negro puro (`bg-black`). Logo, título y texto descriptivo flotan directamente sobre el fondo. Botón con bordes reemplazado por texto limpio interactivo **[ Continuar en el navegador ]** (`text-neutral-400 underline underline-offset-4 hover:text-white`) en la parte inferior.
- **Compatibilidad:** `PowerAppGuard.tsx` no requirió cambios — las props (`onActivated`, `onContinue`) se mantuvieron intactas.
- **Eliminada dependencia del workaround:** `DB_MESSAGING_PLATFORMS` en `src/services/supabase.ts` ahora incluye `'ninjabot'` (tras la migración `add_ninjabot_to_messaging_platform_enum` aplicada en producción). `toDbPlatform` ya no degrada `'ninjabot'` → `'whatsapp'`.
- **Verificado:** `npx tsc --noEmit -p tsconfig.app.json` (TSC_OK) y `npx oxlint` sobre los 4 archivos (0 warnings, 0 errors).
- **Limpieza:** Eliminados `src/components/power/PowerAct` y `src/components/power/PwaReminderScreen` (duplicados sin extensión creados accidentalmente) que rompían el build con `PARSE_ERROR`. Tras la limpieza, `npm run build` compila sin errores (1893 módulos transformados, PWA v1.3.0 generada).

### [2026-07-31] - Migración del Logo a SVG Oficial (favicon) + Eliminación de Assets Obsoletos

- **Agregado:** Variantes SVG oficiales del logo Ninjabot basadas en el branding real (`favicon.svg`):
  - `src/assets/ninjabot/ninjabot-logo.svg` — variante color oficial
  - `src/assets/ninjabot/ninjabot-logo-blanco.svg` — variante blanca
  - `src/assets/ninjabot/ninjabot-logo-negro.svg` — variante negra
- **Actualizado:** `src/assets/ninjabot/index.ts` — El barril `NINJABOT_LOGO` ahora apunta a los SVG oficiales en lugar de los PNG obsoletos.
- **Eliminado:** `src/assets/ninjabot/ninjabot-logo.png`, `ninjabot-logo-blanco.png`, `ninjabot-logo-negro.png` — PNGs antiguos que el login renderizaba como "logo anterior".
- **Eliminado:** Assets de plantilla de Vite no usados: `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`.
- **Limpieza:** Eliminado archivo huérfano `src/assets/ninj` (path truncado) que rompía el build.
- **Verificado:** `npx tsc --noEmit` (TSC_OK) y `npm run build` (éxito — 1893 módulos, PWA v1.3.0, los 3 SVG empaquetados en dist).

### [2026-07-31] - Estandarización de la Marca Ninjabot (Logo Component + Assets Barril)

- **Agregado:** `src/components/common/NinjabotLogo.tsx` — Componente `[Brand]` reutilizable que centraliza el uso del logotipo oficial de Ninjabot. Props: `variant` (`'color' \| 'blanco' \| 'negro'`), `size` (`'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'`), `className`, `alt`.
- **Agregado:** `src/assets/ninjabot/index.ts` — Barril tipado `NINJABOT_LOGO` (color, blanco, negro) + tipo `NinjabotLogoVariant`. Único origen de verdad para los assets de marca.
- **Reorganizado:** Assets renombrados y movidos a `src/assets/ninjabot/` con nomenclatura estándar (inicialmente `ninjabot-logo.png`, `ninjabot-logo-blanco.png`, `ninjabot-logo-negro.png` — posteriormente reemplazados por SVG oficiales en la migración "Migración del Logo a SVG Oficial").
- **Eliminado:** `src/assets/logo-ninjabot.svg` — Icono genérico que no representaba el branding real del favicon.
- **Refactor:** Migrados 6 usos directos de assets al componente `NinjabotLogo` (`GlobalHeader`, `LoginScreen`, `SidebarPC`, `Header`, `ChatN3MessagesFeed`, `ControlShare`).
- **Eliminado:** Filtro CSS `brightness-0 invert` en `ControlShare.tsx` — sustituido por `variant="blanco"`.
- **Agregado:** `docs/components/common/NinjabotLogo.md` — Ficha técnica con props, variantes, tamaños, ejemplos y convenciones.
- **Verificado:** `npm run build` sin errores (los assets empaquetados correctamente en `dist/assets/`; ver migración posterior a SVG).

### [2026-07-30] - Pase 1: Sanitización de Plataformas + Integración de ChatN2ListPanel

- **Corregido:** `ChannelType` en `src/components/demo/common/ChannelIcons.tsx` — `'facebook'` renombrado a `'messenger'` para alinearse con `MessagingPlatform`.
- **Corregido:** `MOCK_CHATS` en `ChatsFeature.tsx`, `ChatsFeatureSandbox.tsx` y `ChatsFeature.demo.tsx` — `channel: 'facebook'` cambiado a `'messenger'` (Ana Silva).
- **Corregido:** `channelCounts` y `mockPlatformStatus` — claves `'facebook'` → `'messenger'` en los 3 archivos.
- **Refactor:** `ChatsFeature.tsx` — Eliminada la lista inline de 120+ líneas con `MOCK_CHATS` y renderizado manual. Ahora usa `<ChatN2ListPanel>` con las props del `NavigationState`.
- **Refactor:** `MOCK_CHATS` migrado de `MockChat[]` a `Contact[]` (tipado correcto, campos como `platform`, `lastMessage`, `unreadCount`).
- **Eliminados:** Imports huérfanos en `ChatsFeature.tsx` (`Badge`, `LeadTemperatureMeter`, `ChannelIcon`, `ChatN2Header`, `ChatN2Filters`, `DENSITY_GAP_MAP`, `DENSITY_CARD_BASE`).
- **Actualizado:** `DOCUMENTO_MADRE.md` — Sección de Jerarquía Espacial (N2 marcado como ✅ Activo), tabla de taxonomía (ChatN2ListPanel ✅), sección de incumplimientos (2 resueltos, 2 pendientes).

### [2026-07-30] - Auditoría Completa del Módulo ChatsFeature (Composición, Navegación e Interactividad)

- **Auditoría Realizada:** Análisis exhaustivo de `ChatsFeature.tsx` y sus 11 componentes hijos.
- **Documentado:** Árbol de composición completo (N1-N4), flujo de navegación Desktop/Mobile, interactividad de handlers y callbacks.
- **Hallazgo Crítico:** `ChatN2ListPanel.tsx` definido y exportado pero **NO utilizado** por `ChatsFeature.tsx` (usa lista inline con `MOCK_CHATS`). Pendiente migración.
- **Hallazgo de Inconsistencia:** El mock `Ana Silva` usa `channel: 'facebook'` que no existe en el tipo `MessagingPlatform` (debería ser `'messenger'`).
- **Documentado:** Inventario taxonómico completo de 12 componentes con estado de uso (✅ Activo / ❌ No usado).
- **Documentado:** Diagrama detallado del flujo de datos (props → orquestador → subcomponentes → callbacks → padre).
- **Actualizado:** Secciones 1 (Jerarquía Espacial con responsividad), 2 (Taxonomía detallada), 3 (Controles activos), 4 (Reglas de estado + incumplimientos).

### [2026-07-29] - Refactorización Completa del Orquestador ChatsFeature
- **Agregado:** `ChatN3Header.tsx` — Header taxonómico N3 extraído de `ChatN3DetailPanel` (Row 1: LeadTemp+Avatar+IA Toggle, Row 2: Stage+Acciones).
- **Agregado:** `ChatN4Header.tsx` — Header taxonómico N4 con retorno obligatorio (`onBack`) y tabs internas (AI Agent / Notas).
- **Refactor:** `ChatsFeature.tsx` — Orquestador con `NavigationState` centralizado (`selectedChatId`, `n4View`, `platformFilter`, `searchQuery`). N4 como 100% Focus Overlay (`absolute inset-0 z-30`).
- **Refactor:** `ChatN2ListPanel.tsx` — `activePlatform` recibido por props (`onPlatformChange`), eliminado estado local `PlatformFilter`.
- **Refactor:** `ChatN3DetailPanel.tsx` — Consume `ChatN3Header`, elimina tipo local `Note`.
- **Refactor:** `ChatN4SubDetailPanel.tsx` — Consume `ChatN4Header`, elimina tipo local `SubView`.
- **Agregado:** `src/types.ts` — Tipos `PlatformFilter`, `LeadTemperatureLevel`, campo `leadLevel` en `Contact`.
- **Agregado:** `src/demo/ChatsFeatureSandbox.tsx` — Sandbox autónomo para pruebas del orquestador.

### [2026-07-29] - Estandarización de Arquitectura y Agentes
- **Agregado:** Creación del `DOCUMENTO_MADRE.md` en la raíz.
- **Refactor:** Definición del patrón `Control[Entidad]` y `Focus Overlay 100%` para N4 sobre N3.
- **Arquitectura:** Separación de responsabilidades entre Agente Frontend/Tech Lead y Agente Backend/Integraciones.
