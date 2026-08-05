# 📊 Reporte de Estilos CSS y Sistema de Diseño — Ninjabot

**Fecha de auditoría:** 8 Abril 2026  
**Alcance:** Análisis de estilos globales, tokens, utilidades custom y recomendaciones de optimización UI/UX  
**Archivos auditados:**
- `src/index.css` (375 líneas)
- `tailwind.config.js` (24 líneas)
- `src/App.css` (1 línea — vacío)
- `postcss.config.js` (6 líneas)
- `src/theme/ThemeContext.tsx` (77 líneas)
- `src/demo/uiux/` (UiUxView, GlobalTokensInspector, ComponentPlayground)
- 60+ archivos `.tsx` con clases Tailwind

---

## 📋 Tabla de Contenidos

1. [Arquitectura Global de Estilos](#1-arquitectura-global-de-estilos)
2. [Tokens Globales Definidos (Capa 1)](#2-tokens-globales-definidos-capa-1)
3. [Clases Utilitarias Personalizadas](#3-clases-utilitarias-personalizadas)
4. [Animaciones y Scroll](#4-animaciones-y-scroll)
5. [Temas Light/Dark](#5-temas-lightdark)
6. [Inconsistencias Detectadas](#6-inconsistencias-detectadas)
7. [Recomendaciones para Optimizar UI/UX](#7-recomendaciones-para-optimizar-uiux)
8. [Prioridades de Implementación](#8-prioridades-de-implementación)

---

## 1. Arquitectura Global de Estilos

### 1.1 Capa de Estilos

El proyecto tiene **3 archivos CSS/estilos globales**:

| Archivo | Rol | Estado |
|---|---|---|
| `src/index.css` | Almacén principal: tokens CSS, utilidades custom, animaciones, scrollbars | ✅ Activo (375 líneas) |
| `tailwind.config.js` | Configuración del framework: colores extendidos + box-shadow | ✅ Activo (24 líneas) |
| `src/App.css` | Archivo vacío de 1 línea | ⚠️ Inerte |

### 1.2 Stack Tecnológico

- **Tailwind CSS v3.4.19** — utilidades clase-primero con `darkMode: 'class'`
- **PostCSS + Autoprefixer v10** — pipeline de compilación
- **Sin CSS Modules** — toda la estilización vive en clases Tailwind dentro de componentes
- **Sin CSS-in-JS** — no hay styled-components, emotion, etc.
- **Sin preprocesadores** (SASS/LESS) — solo PostCSS nativo
- **Sin fuentes externas** — usa `font-sans` del sistema por defecto (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`)

### 1.3 Flujo de Compilación

```
src/**/*.tsx + index.html
    ↓  (content scan)
tailwind.config.js  →  JIT compiler
    ↓
PostCSS + Autoprefixer
    ↓
src/index.css  (incluye @tailwind base, components, utilities)
    ↓
Bundle Vite
```

---

## 2. Tokens Globales Definidos (Capa 1)

### 2.1 Variables CSS Custom (`:root` en `src/index.css`)

| Variable | Default | Propósito | Control Dinámico |
|---|---|---|---|
| `--card-padding` | `16px` | Densidad/espaciado de tarjetas | ✅ Slider real-time (16→32px) |
| `--glass-blur` | `4px` | Materialidad glassmorphism | ✅ Slider real-time (4→20px) |
| `--text-secondary-weight` | `300` | Contraste tipográfico secundario | ✅ Toggle 400↔500 |
| `--accent-color` | `#e056fd` | Color de acento de marca | ✅ Selector (Rosa/WhatsApp/Industrial) |
| `--panel-header` | `#151515` | Superficie header modo oscuro | ❌ Estático |
| `--panel-n1` | `#151515` | Sidebar raíz modo oscuro | ❌ Estático |
| `--panel-n2` | `#171717` | Listas/feeds modo oscuro | ❌ Estático |
| `--panel-n3` | `#141414` | Workspace N3 oscuro | ❌ Estático |
| `--panel-n4` | `#151515` | Overlay contextual oscuro | ❌ Estático |
| `--shadow-panel-top` | `0 8px 32px rgba(0,0,0,0.25)` | Sombra ambiental header | ❌ Estático |
| `--shadow-panel-n4-left` | `-12px 0 32px rgba(0,0,0,0.35)` | Sombra directional N4 | ❌ Estático |

### 2.2 Tokens en `tailwind.config.js`

| Token | Valor | Propósito |
|---|---|---|
| `colors.border` | `rgba(0,0,0,0.05)` | Borde translúcido enterprise (regla estricta: nunca sólido opaco) |
| `colors.brand` | `#18181B` | Color primario de marca (zinc-900 near-black) |
| `boxShadow.soft` | `0 20px 40px rgba(0,0,0,0.03)` | Sombra ambiental desenfocada (prohibido shadow-md/lg/xl) |

### 2.3 Jerarquía de Superficies del Sistema de Diseño

```
Silueta de Paneles (modo oscuro — token sólidos):
┌─────────────────────────────────────────────┐
│  header  #151515                           │  ← --panel-header
├──────────┬──────────────────────────────────┤
│          │                                  │
│  N1      │          N3                      │
│  #151515 │    #141414  (workspace)          │  ← --panel-n3
│          │                                  │
│          ├───────────────┬──────────────────┤
│          │               │                  │
│          │  N2           │    N4            │
│          │  #171717      │    #151515       │  ← --panel-n4 (floating)
│          │               │    + shadow-left │
├──────────┴───────────────┴──────────────────┤
│  footer                                     │
└─────────────────────────────────────────────┘

Modo claro: glassmorphism translúcido (bg-white/80 + backdrop-blur)
Jerarquía por contraste tonal micro-sutil (1%–2%) + sombras ambientales
Cero bordes físicos en modo oscuro
```

---

## 3. Clases Utilitarias Personalizadas

### 3.1 Superficies Glassmorphism (`@layer components`)

| Clase | Light | Dark | Uso |
|---|---|---|---|
| `glass-card-light` | `bg-white/80 border-black/5` | — | Superficie principal de tarjeta/panel |
| `glass-card-dark` | — | `bg-[#151515]/80 border-white/10` | Superficie principal modo oscuro |
| `glass-subtle-light` | `bg-white/60 border-black/5` | — | Paneles internos ultra-translúcidos |
| `glass-subtle-dark` | — | `bg-white/5 border-white/10` | Paneles internos oscuros |
| `glass-chip-light` | `bg-black/5 border-black/5` | — | Chips/badges/filtros |
| `glass-chip-dark` | — | `bg-white/5 border-white/10` | Chips/dark |

Todas heredan `padding: var(--card-padding, 16px)` y `backdrop-filter: blur(var(--glass-blur, 4px))`.

### 3.2 Jerarquía Tipográfica

| Clase | Tamaño | Peso | Color (Light) | Color (Dark) |
|---|---|---|---|---|
| `text-title` | 14px (text-sm) | medium | `gray-900/90` | `white/90` |
| `text-secondary` | 12px (text-xs) | `var(--text-secondary-weight)` | `gray-500/80` | `white/50` |
| `text-body` | 14px | normal | `gray-600/80` | `white/60` |
| `text-meta` | 11px | normal | `gray-400/40` | `white/40` |
| `text-caption` | 10px | normal | `gray-400/40` | `white/40` |

**Regla de tracking:** todas usan `tracking-wide`.

### 3.3 Microinteracciones

| Clase | Efecto | Caso de uso |
|---|---|---|
| `hover-lift` | `translate-y-0.5 + shadow` en hover | Tarjetas clickables |
| `active-press` | `scale-95` en active | Botones e íconos |
| `fab-raised` | `scale-90 active / scale-105 hover` | FAB móvil |

### 3.4 Paneles Limpios — Jerarquía N1–N4

| Clase | Light | Dark |
|---|---|---|
| `panel-header-clean` | `bg-white/80 backdrop-blur-md` | `var(--panel-header)` + shadow-top |
| `panel-n1-clean` | `bg-white/80 backdrop-blur-md` | `var(--panel-n1)` |
| `panel-n2-clean` | `bg-white/80 backdrop-blur-md` | `var(--panel-n2)` |
| `panel-n3-clean` | `bg-transparent` | `var(--panel-n3)` |
| `panel-n4-floating` | `bg-white/80 backdrop-blur-md` | `var(--panel-n4)` + shadow-left |

**Filosofía de diseño:** Separación espacial por contraste tonal micro-sutil en vez de bordes físicos. Eliminación total de bordes rígidos en modo oscuro.

### 3.5 Utilidades de Media

| Clase | Propósito |
|---|---|
| `card-media-inset` | Inset proporcional para imágenes con contorno sutil |
| `card-media-inset-bordered` | Variante con contorno luminoso (borde de luz) |

### 3.6 Utilidades de Scrollbar

| Clase | Propósito |
|---|---|
| `hide-scrollbar` | Oculta scrollbar (Webkit + Firefox) |
| `scrollbar-none` | Alias moderno para carruseles horizontales |

---

## 4. Animaciones y Scroll

### 4.1 Keyframes Definidos

| Animación | Duración | Easing | Uso |
|---|---|---|---|
| `fade-in` | 0.25s | ease-out | Overlays, paneles de entrada |
| `slide-in-right` | 0.25s | ease-out | Drawer móvil |
| `slide-in-up` | 0.3s | `cubic-bezier(0.16,1,0.3,1)` | Overlay premium iOS (PWA) |
| `bounce-down` | 1.4s | ease-in-out | Ícono compartir (guía iOS) |
| `blink` | 1s | step-end | Cursor Typewriter (IA) |

### 4.2 Scrollbars Personalizadas

**Webkit (Chrome/Safari/Edge):**

| Estado | Light | Dark |
|---|---|---|
| `thumb` | `#d4d4d4` (neutral-300) | `#52525b` (neutral-600) |
| `thumb:hover` | `#a1a1aa` (neutral-400) | `#71717a` (neutral-500) |
| `thumb:active` | `#737373` (neutral-500) | `#a1a1aa` (neutral-400) |

- Track: transparente
- Border: 2px transparent + `background-clip: padding-box`
- Radius: `9999px` (pill)

**Firefox:**
```css
html {
  scrollbar-width: thin;
  scrollbar-color: #d4d4d4 transparent; /* light */
}
html.dark {
  scrollbar-color: #52525b transparent; /* dark */
}
```

---

## 5. Temas Light/Dark

### 5.1 Implementación

- **Mecanismo:** clase `dark` en `<html>` (`darkMode: 'class'`)
- **Contexto:** `ThemeContext.tsx` — persistencia en `localStorage('ninjabot-theme')`
- **Anti-flash:** script inline en `index.html` aplica clase antes de que React monte
- **Meta theme-color:** se actualiza dinámicamente (`#ffffff` light / `#18181B` dark)
- **Default:** `light`

### 5.2 Comparativo de Superficies

| Aspecto | Light | Dark |
|---|---|---|
| **Fondo panel N1** | `bg-white/80` + blur | `#151515` |
| **Fondo panel N2** | `bg-white/80` + blur | `#171717` |
| **Fondo panel N3** | transparente | `#141414` |
| **Fondo panel N4** | `bg-white/80` + blur | `#151515` + shadow-left |
| **Bordes** | `border-black/5` | `border-white/10` |
| **Theme-color meta** | `#ffffff` | `#18181B` |
| **Scrollbar thumb** | `#d4d4d4` | `#52525b` |
| **Sombra header** | — | `0 8px 32px rgba(0,0,0,0.25)` |

---

## 6. Inconsistencias Detectadas

### 6.1 🔴 Colores Hardcodeados (107 ocurrencias de hex en `.tsx`)

**Colores de marca repetidos sin tokenizar:**

| Color Hex | Descripción | Archivos afectados |
|---|---|---|
| `#e056fd` | Acento rosa Ninjabot | GlobalTokensInspector, SettingsN3DetailPanel, SettingsN2ListPanel |
| `#25D366` | WhatsApp green | WhatsAppOnboarding, SourceBadge, NotificationsN2/N3, ChatN2FeedCard, channelConfig, FunnelPanel |
| `#1877F2` | Facebook blue | WhatsAppOnboarding, CompanySettings, PlatformConnectModal, NotificationsN2/N3, channelConfig, SettingsN3DetailPanel |
| `#DD2A7B` | Instagram | SourceBadge, ChatN2FeedCard, NotificationsN2/N3, ChatN3MessagesFeed, channelConfig |
| `#006AFF` | Messenger | SourceBadge, ChatN2FeedCard, ChatN3MessagesFeed, channelConfig, PlatformConnectModal |
| `#0a0a0f` | Fondo inmersivo oscuro | VideoCard, ChatDemoN2ListPanel, Avatar.tsx |

**Grises legacy (familia paralela a escala neutral de Tailwind):**

| Hex | Equivalente Tailwind | Archivos afectados |
|---|---|---|
| `#eaeaea` | `neutral-100` | ContactsPanel, FunnelPanel, NotificationDetailPanel |
| `#d8d8db` | `neutral-200` | ContactsPanel, FunnelPanel |
| `#efeff0` | `neutral-50` | ContactsPanel, NotificationsListPanel |
| `#ececec` | `neutral-100` | ChatNoteForm, ChatNotesTimeline, AIAgentSettings |
| `#ededed` | `neutral-100` | AIAgentSettings |
| `#dedede` | `neutral-200` | ContactsPanel |
| `#c2c2c8` | `neutral-300` | ContactsPanel, FunnelPanel |
| `#d2d2d6` | `neutral-200` | ContactsPanel, FunnelPanel |
| `#f0f0f2` | `neutral-50` | FunnelPanel, CompanySettings |

**Total: ~15 hex values duplicados en ~20 archivos diferentes.**

### 6.2 🔴 Sombras fuera de la regla estricta

La regla documentada prohíbe `shadow-md/lg/xl/2xl` (usar solo `shadow-soft` o `shadow-[0_20px_40px_rgba(0,0,0,0.03)]`). Sin embargo:

| Clase Prohibida | Ocurrencias | Archivos |
|---|---|---|
| `shadow-md` | 3 | SidebarPC (badges count ×2), AIAgentSettings (toggle) |
| `shadow-lg` | 5 | WhatsAppOnboarding (botón), PlatformConnectModal (avatar + botón), SettingsPanel (loading), SaleRegistrationModal (avatar) |
| `shadow-2xl` | 5 | NewContactModal, PlatformConnectModal, SaleRegistrationModal, VideoCard (modo teatro), WhatsAppOnboarding (logo) |

### 6.3 🟡 Bordes inconsistentes

- **44 ocurrencias** de `border-gray-200` / `border-gray-300` en componentes legacy
- La regla estricta dice "borde translúcido, nunca sólido opaco" pero:
  - `border-gray-200` (ChatNoteForm, AIAgentSettings, ChatNotesTimeline, CompanySettings, SidebarPC, NotificationsListPanel, NotificationDetailPanel, ProfileSettings)
  - `border-gray-300` (ContactsPanel, FunnelPanel, NotificationDetailPanel)
- `border-2 border-black` — botones legacy "Guardar" (ContactsPanel, CompanySettings, ProfileSettings, FunnelPanel)

### 6.4 🟡 Radios de esquina inconsistente

- **300+ usos** de `rounded-full` (mayormente correctos: avatares, badges, pills)
- **Múltiples radios en competencia:**
  - `rounded-lg` (8px) — inputs legacy, iconos
  - `rounded-xl` (12px) — controles, botones
  - `rounded-2xl` (16px) — tarjetas, modales
  - `rounded-3xl` (24px) — modales, contenedores grandes
  - `rounded-none` — contenedores del sandbox (regla estricta)
- La regla "sin `rounded-*` en contenedores principales" solo se aplica en el Sandbox
- Componentes legacy usan `rounded-2xl`/`rounded-3xl` extensivamente como contenedores

### 6.5 🟡 Focus ring inconsistente

| Patrón | Ocurrencias | Archivos |
|---|---|---|
| `focus:ring-2 focus:ring-black/20` | ~25 | Componentes legacy (inputs) |
| `focus:ring-1 focus:ring-brand/50` | ~5 | Sandbox moderno |
| `focus:ring-2 focus:ring-black` | ~5 | Modales legacy |
| `focus-within:ring-2 focus-within:ring-black/20` | ~3 | Input groups |

### 6.6 🟡 Hover inconsistente

| Patrón | Ocurrencias | Archivos |
|---|---|---|
| `hover:bg-black/5` | ~20 | Sandbox moderno |
| `hover:bg-gray-100` | ~15 | Componentes legacy |
| `hover:bg-gray-50` | ~8 | Componentes legacy |
| `hover:bg-black/10` | ~5 | Sandbox moderno |

### 6.7 🟢 `App.css` — Archivo vacío

- Solamente contiene 1 línea en blanco
- Importado en `main.tsx`? **No** — solo `index.css` se importa
- Se puede eliminar o aprovechar para estilos críticos

---

## 7. Recomendaciones para Optimizar UI/UX

### 7.1 🔴 Alta Prioridad — Unificar Tokens de Color

**Acción:** Migrar los ~107 hex hardcodeados a tokens en `tailwind.config.js`.

```js
// tailwind.config.js — añadir a theme.extend.colors
colors: {
  // ...existente
  whatsapp: '#25D366',
  facebook: '#1877F2',
  messenger: '#006AFF',
  instagram: '#DD2A7B',
  accent: '#e056fd',
  immersive: '#0a0a0f',
  surface: {
    legacy: '#eaeaea',
    legacy2: '#d8d8db',
  },
}
```

**Beneficio UX:** Consistencia visual de marca, re-skinnable, modo oscuro mejorado.

### 7.2 🔴 Alta Prioridad — Eliminar Sombras Prohibidas

**Acción:** Reemplazar `shadow-md`, `shadow-lg`, `shadow-2xl` por el token `shadow-soft`.

| Antes | Después |
|---|---|
| `shadow-md` | `shadow-soft` |
| `shadow-lg` | `shadow-soft` |
| `shadow-2xl` | `shadow-soft` o `shadow-[0_20px_40px_rgba(0,0,0,0.03)]` |
| `shadow-none` | mantener (casos especiales: VideoCard teatro, thumbnails) |

Excepción justificada: `VideoCard` en modo teatro necesita `shadow-2xl bg-black` para profundidad inmersiva del video — documentar como excepción.

### 7.3 🟡 Media Prioridad — Consolidar Grises Legacy

**Acción:** Mapear hex legacy → escala Tailwind.

| Hex Legacy | Reemplazo |
|---|---|
| `#eaeaea` | `bg-neutral-100` |
| `#d8d8db` | `bg-neutral-200` |
| `#efeff0` | `bg-neutral-50` |
| `#ececec` | `bg-neutral-100` |
| `#ededed` | `bg-neutral-100` |
| `#dedede` | `bg-neutral-200` |
| `#c2c2c8` | `bg-neutral-300` |
| `#d2d2d6` | `bg-neutral-200` |
| `#f0f0f2` | `bg-neutral-50` |

### 7.4 🟡 Media Prioridad — Unificar Bordes

**Acción:** Reemplazar `border-gray-200/300` por el token `border` (que ya es `rgba(0,0,0,0.05)`).

**Excepción:** Si un componente necesita un borde más visible (inputs), usar `border-black/10` en vez de `border-gray-300`.

### 7.5 🟡 Media Prioridad — Crear Escala de Radios Estricta

**Acción:** Definir una escala canónica de radios y documentarla.

| Level | Clase | Valor | Uso |
|---|---|---|---|
| S0 | `rounded-none` | 0px | Contenedores de panel N1–N4 |
| S1 | `rounded-lg` | 8px | Inputs, controles, iconos |
| S2 | `rounded-xl` | 12px | Tarjetas compactas, botones |
| S3 | `rounded-2xl` | 16px | Superficies, modales del sandbox |
| S4 | `rounded-3xl` | 24px | Overlays flotantes, modales premium |
| S∞ | `rounded-full` | 9999px | Avatares, badges, pills, botones circulares |

### 7.6 🟡 Media Prioridad — Añadir Fuente Definida

**Acción:** Definir la tipografía explícitamente en `tailwind.config.js` y el `body` de `index.css`.

```js
// tailwind.config.js
fontFamily: {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

**Beneficio:** Consistencia tipográfica entre plataformas y PWA.

### 7.7 🟡 Media Prioridad — Mover Componentes Legacy al Sistema N1–N4

Componentes que aún usan el sistema de grises antiguo:

| Componente | Acción |
|---|---|
| `ContactsPanel.tsx` | Migrar a `panel-n2-clean` / `glass-subtle-*` |
| `FunnelPanel.tsx` | Migrar a `panel-n2-clean` / `glass-card-*` |
| `SettingsPanel.tsx` | Migrar a `panel-n3-clean` |
| `NotificationsListPanel.tsx` | Migrar a `panel-n2-clean` |
| `NotificationDetailPanel.tsx` | Migrar a `glass-card-*` |
| `ChatNoteForm.tsx` / `ChatNotesTimeline.tsx` | Migrar a `glass-subtle-*` |
| `AIAgentSettings.tsx` | Migrar a `glass-card-*` |
| `NewContactModal.tsx` / `SaleRegistrationModal.tsx` / `PlatformConnectModal.tsx` | Migrar a estética de modales del Sandbox |
| `CompanySettings.tsx` / `ProfileSettings.tsx` | Migrar a `glass-card-*` |

### 7.8 🟢 Mejoras UX Específicas

**9. Contraste de texto secundario**
- El token `--text-secondary-weight` arranca en `300` (Light)
- La documentación del propio sistema dice: *"Evita fuentes Light (300) por legibilidad"*
- **Cambiar default:** `--text-secondary-weight: 400;`

**10. Unificar focus rings**
- Elegir un patrón único: `focus:ring-1 focus:ring-brand/50 focus:outline-none`
- Aplicarlo a todos los inputs del sistema

**11. Unificar hovers**
- Crear utilidad custom `.hover-subtle` con `hover:bg-black/5 dark:hover:bg-white/10`
- Aplicarla en toda la app

**12. Soporte `prefers-reduced-motion`**
```css
/* src/index.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**13. Transiciones de tema suave**
- El cambio light↔dark es abrupto en la mayoría de los componentes
- Añadir `transition-colors duration-300` en los contenedores raíz de cada vista (algunos ya lo hacen)

**14. Extraer checkerboard a utilidad**
- `ComponentPlayground` usa un patrón inline `repeating-conic-gradient`
- Crear clase utilidad reutilizable:

```css
@layer utilities {
  .bg-checkerboard {
    background-image: repeating-conic-gradient(rgba(0,0,0,0.04) 0% 25%, transparent 0% 50%);
    background-size: 32px 32px;
  }
  .dark .bg-checkerboard {
    background-image: repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, transparent 0% 50%);
  }
}
```

**15. Eliminar `App.css`**
- Archivo vacío de 1 línea sin uso
- Eliminarlo o usarlo para base CSS crítica (reset, font-face, seguridad)

**16. Definir breakpoints consistentes**
- El sistema usa mayormente `sm:`, `md:`, `lg:` estándar
- Algunos componentes usan `md:` para cambios de layout de 3 columnas mientras otros usan CSS custom `min-w-[340px]` — documentar la estrategia

---

## 8. Prioridades de Implementación

### P0 — Inmediato (Urgente para consistencia visual)

| # | Acción | Archivos |
|---|---|---|
| 1 | Tokenizar colores de marca | 20+ archivos |
| 2 | Eliminar sombras prohibidas | 8 archivos |
| 3 | Cambiar default `--text-secondary-weight` a `400` | `index.css` + `GlobalTokensInspector` |
| 4 | Añadir `prefers-reduced-motion` | `index.css` |

### P1 — Corto Plazo (Mejorar consistencia)

| # | Acción | Archivos |
|---|---|---|
| 5 | Consolidar grises legacy a escala neutral | ~10 archivos |
| 6 | Unificar bordes con token `border` | ~10 archivos |
| 7 | Definir escala de radios canónica | Documentación + `tailwind.config.js` |
| 8 | Definir fuentes en config | `tailwind.config.js` + `index.css` |

### P2 — Medio Plazo (Arquitectura)

| # | Acción | Archivos |
|---|---|---|
| 9 | Migrar componentes legacy al sistema N1–N4 | 9 componentes |
| 10 | Unificar focus rings y hovers | 30+ archivos |
| 11 | Eliminar `App.css` vacío | raíz |
| 12 | Extraer checkerboard a utilidad | `index.css` + `ComponentPlayground` |

### P3 — Largo Plazo (Evolución)

| # | Acción |
|---|---|
| 13 | Esperar migración a Tailwind v4 (variables CSS nativas) |
| 14 | Explorar `@theme` de Tailwind v4 para tokens extendidos |
| 15 | Evaluar introducción de design tokens en JSON reutilizable |
| 16 | Documentar el sistema completo en Storybook o equivalente |

---

## 📌 Resumen Ejecutivo

| Dimensión | Estado | Notas |
|---|---|---|
| **Arquitectura de estilos base** | 🟢 | Tailwind + tokens CSS bien definidos |
| **Sistema de diseño Sandbox (Capa 1)** | 🟢 | Maduro, documentado, con inspector interactivo |
| **Modo oscuro** | 🟢 | Implementación sólida con tokens N1–N4 |
| **Jerarquía espacial N1–N4** | 🟢 | Contrastes tonales + sombras ambientales coherentes |
| **Animaciones** | 🟢 | 5 keyframes bien escalados, falta reducir-motion |
| **Componentes legacy** | 🔴 | Usan colores hardcodeados, sombras prohibidas, bordes sólidos |
| **Tokenización de colores de marca** | 🔴 | 107 hex hardcodeados, sin tokens centralizados |
| **Escala de radios** | 🟡 | Múltiples radios en competencia sin jerarquía documentada |
| **Fuentes tipográficas** | 🟡 | Solo sistema sans, sin definición explícita |
| **Accesibilidad (reduced motion)** | 🔴 | No implementado |
| **Consistencia focus/hover** | 🟡 | Múltiples patrones en paralelo |

**Conclusión:** El sistema de diseño de Capa 1 es sólido y bien arquitectado, pero existe una **brecha significativa entre el Sandbox moderno y los componentes legacy**. La prioridad es migrar los componentes antiguos a los tokens de Capa 1 para lograr una experiencia visual unificada en toda la aplicación.

---

*Documento generado automáticamente tras auditoría del codebase. Fecha: 8 Abril 2026.*