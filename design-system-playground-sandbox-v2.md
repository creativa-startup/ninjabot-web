# 🎨 Especificación de Interfaz y Blueprint de Código: Taller de Componentes Decoplado (v2)

Este documento establece el plano de construcción de ingeniería para desacoplar el **Estudio del Sistema de Diseño (Apariencia UI/UX)** y su **Taller de Componentes (Component Playground)** en un módulo independiente dentro del Sandbox en la ruta `src/demo/uiux/`. 

Esta refactorización modular extrae toda la complejidad visual y de mocks de `SettingsN3DetailPanel.tsx`, dejándolo sumamente limpio, mantenible y alineado con el **Principio de Responsabilidad Única (SRP)** de la arquitectura de Ninjabot.

---

## 📂 1. Nueva Estructura de Directorios

El laboratorio de interfaz y playground del Sandbox se organiza en la siguiente jerarquía de archivos:

```text
src/demo/
└── uiux/                            ← Directorio principal del módulo de diseño
    ├── components/
    │   ├── GlobalTokensInspector.tsx ← Controles de Capa 1 (Padding, Blur, Acento global)
    │   └── ComponentPlayground.tsx   ← Inspector dinámico con lienzo de ajedrez sutil
    ├── mockPlaygroundData.ts        ← Constantes y tipos de datos simulados de alta fidelidad
    └── UiUxView.tsx                 ← Orquestador y guardián de rol (Admin-Only)
```

---

## 📊 2. Especificación Completa de Archivos

### 📄 Archivo 1: `src/demo/uiux/mockPlaygroundData.ts`
*Responsabilidad:* Encapsular todos los datos de simulación y contratos de tipado para evitar el "Spaghetti de Importaciones" en los componentes de UI.

```typescript
import { Heart, MessageCircle, Send, Check } from 'lucide-react';

export type TargetComponent = 'post' | 'product' | 'create-post' | 'video';

export interface PlayPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  channel: 'whatsapp' | 'instagram' | 'messenger' | 'ninjabot';
  metrics: { likes: number; comments: number; shares: number };
}

export interface PlayProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  sku: string;
  imageUrl: string;
}

export const PLAYGROUND_MOCK_POST: PlayPost = {
  id: 'play-post-1',
  authorName: 'Muro Ninja',
  authorHandle: '@muroninja',
  authorAvatar: 'MN',
  content: 'Escribiendo el primer Jazs desde el Taller de Componentes. Validando la legibilidad del texto secundario de 12px y el contraste por color de las micro-interacciones. #designsystem #nextgen',
  timestamp: 'Hace 2 minutos',
  channel: 'instagram',
  metrics: { likes: 142, comments: 24, shares: 8 }
};

export const PLAYGROUND_MOCK_PRODUCT: PlayProduct = {
  id: 'play-prod-1',
  name: 'Taza Cerámica Ópalo',
  price: 24.99,
  currency: 'USD',
  sku: 'TZ-OPALO',
  imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop'
};
```

---

### 📄 Archivo 2: `src/demo/uiux/components/GlobalTokensInspector.tsx`
*Responsabilidad:* Controlar y mutar de manera interactiva a nivel de `:root` de CSS los tokens espaciales de la Capa 1, incluyendo una tarjeta de verificación de consistencia en vivo.

```tsx
import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

export const GlobalTokensInspector: React.FC = () => {
  const [padding, setPadding] = useState(24); // default cómodo
  const [blur, setBlur] = useState(12);       // default estándar
  const [fontWeight, setFontWeight] = useState(400); // regular
  const [accent, setAccent] = useState('#e056fd');   // rosa Ninjabot

  const updateCSSVariable = (variable: string, value: string) => {
    document.documentElement.style.setProperty(variable, value);
  };

  const handlePaddingChange = (val: number) => {
    setPadding(val);
    updateCSSVariable('--card-padding', `${val}px`);
  };

  const handleBlurChange = (val: number) => {
    setBlur(val);
    updateCSSVariable('--glass-blur', `${val}px`);
  };

  const handleWeightToggle = () => {
    const nextWeight = fontWeight === 400 ? 500 : 400;
    setFontWeight(nextWeight);
    updateCSSVariable('--text-secondary-weight', String(nextWeight));
  };

  const handleAccentChange = (color: string) => {
    setAccent(color);
    updateCSSVariable('--accent-color', color);
  };

  return (
    <div className=\"max-w-xl space-y-6 animate-fade-in\">
      {/* 1. Control de Densidad */}
      <div className=\"bg-white p-5 rounded-2xl border border-black/5 space-y-3 shadow-soft\">
        <div className=\"flex justify-between items-center\">
          <span className=\"text-xs font-semibold text-gray-900\">Densidad (Padding de Tarjetas)</span>
          <span className=\"text-[11px] font-mono text-[#e056fd] font-bold\">{padding}px</span>
        </div>
        <input
          type=\"range\" min=\"16\" max=\"32\" value={padding}
          onChange={(e) => handlePaddingChange(parseInt(e.target.value))}
          className=\"w-full accent-[#e056fd] cursor-pointer\"
        />
        <div className=\"flex justify-between text-[10px] text-gray-400 font-medium\">
          <span>Compacto (16px)</span>
          <span>Cómodo (24px)</span>
          <span>Relajado (32px)</span>
        </div>
      </div>

      {/* 2. Control de Materialidad */}
      <div className=\"bg-white p-5 rounded-2xl border border-black/5 space-y-3 shadow-soft\">
        <div className=\"flex justify-between items-center\">
          <span className=\"text-xs font-semibold text-gray-900\">Materialidad (Glassmorphic Blur)</span>
          <span className=\"text-[11px] font-mono text-[#e056fd] font-bold\">{blur}px</span>
        </div>
        <input
          type=\"range\" min=\"4\" max=\"20\" value={blur}
          onChange={(e) => handleBlurChange(parseInt(e.target.value))}
          className=\"w-full accent-[#e056fd] cursor-pointer\"
        />
        <div className=\"flex justify-between text-[10px] text-gray-400 font-medium\">
          <span>Sutil (4px)</span>
          <span>Brillante (12px)</span>
          <span>Frosted (20px)</span>
        </div>
      </div>

      {/* 3. Contraste de Texto Secundario */}
      <div className=\"bg-white p-5 rounded-2xl border border-black/5 flex items-center justify-between shadow-soft\">
        <div className=\"space-y-0.5\">
          <h4 className=\"text-xs font-semibold text-gray-900\">Contraste Tipográfico</h4>
          <p className=\"text-[10px] text-gray-400 max-w-[280px]\">
            Evita fuentes Light (300) por legibilidad. Alterna entre Regular (400) y Medium (500).
          </p>
        </div>
        <button
          onClick={handleWeightToggle}
          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-300 ${
            fontWeight === 500
              ? 'bg-[#e056fd]/10 text-[#e056fd] border-[#e056fd]/20'
              : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {fontWeight === 400 ? 'Regular (400)' : 'Medium (500) 🔥'}
        </button>
      </div>

      {/* 4. Selector de Color de Acento */}
      <div className=\"bg-white p-5 rounded-2xl border border-black/5 space-y-3 shadow-soft\">
        <h4 className=\"text-xs font-semibold text-gray-900\">Color de Acento de la Marca</h4>
        <div className=\"flex gap-3\">\n          {[\n            { hex: '#e056fd', name: 'Ninjabot Rosa' },\n            { hex: '#25D366', name: 'WhatsApp' },\n            { hex: '#111827', name: 'Industrial B/N' }\n          ].map((c) => (\n            <button\n              key={c.hex}\n              onClick={() => handleAccentChange(c.hex)}\n              className=\"flex items-center gap-2 px-3 py-2 rounded-xl border border-black/5 text-xs bg-gray-50 hover:bg-white hover:shadow-soft transition-all active:scale-[0.98]\"\n            >\n              <span className=\"w-3.5 h-3.5 rounded-full border border-black/10\" style={{ backgroundColor: c.hex }} />\n              <span className=\"text-[11px] font-medium text-gray-600\">{c.name}</span>\n              {accent === c.hex && <Check className=\"w-3 h-3 text-[#e056fd] ml-1\" />}\n            </button>\n          ))}\n        </div>\n      </div>\n\n      {/* 5. Tarjeta de Verificación en Vivo */}\n      <div className=\"p-1\">\n        <h4 className=\"text-xs font-semibold text-gray-900 mb-2\">Previsualización de Tarjeta (Fase Estructural)</h4>\n        <div className=\"glass-card-light p-6 rounded-3xl border border-black/5 shadow-soft space-y-3 bg-white/80 backdrop-blur-md\">\n          <div className=\"flex justify-between items-center\">\n            <span className=\"text-xs font-bold text-gray-900\">Superficie Premium</span>\n            <span className=\"px-2 py-0.5 rounded-full text-[10px] font-bold text-white\" style={{ backgroundColor: accent }}>\n              Activo\n            </span>\n          </div>\n          <p className=\"text-xs text-secondary leading-relaxed\">\n            Esta tarjeta consume los tokens globales inyectados directamente en el documento. Al cambiar los sliders superiores, la GPU renderiza las transiciones instantáneamente a 60 FPS.\n          </p>\n        </div>\n      </div>\n    </div>\n  );\n};\n```\n\n---\n\n### 📄 Archivo 3: `src/demo/uiux/components/ComponentPlayground.tsx`\n*Responsabilidad:* Proporcionar un entorno de inspección de doble columna. La columna izquierda renderiza el lienzo de ajedrez con el componente real de Ninjabot bajo test, y la columna derecha contiene el mando de calibración para sus props visuales.\n\n```tsx\nimport React, { useState } from 'react';\nimport { Heart, MessageCircle, Send, SlidersHorizontal } from 'lucide-react';\nimport { TargetComponent, PLAYGROUND_MOCK_POST, PLAYGROUND_MOCK_PRODUCT } from '../mockPlaygroundData';\n\n// IMPORTACIONES RECIENTES DE COMPONENTES CORE DE NINJABOT\nimport { PostFeedCard } from '../../../features/chats/PostFeedCard';\nimport { ProductCard } from '../../../components/ui/ProductCard';\nimport { ControlCreatePost } from '../../../components/ui/ControlCreatePost';\nimport { VideoCard } from '../../../components/ui/VideoCard';\n\nexport const ComponentPlayground: React.FC = () => {\n  const [selectedComp, setSelectedComp] = useState<TargetComponent>('post');\n  \n  // Controles locales de calibración estética\n  const [compPadding, setCompPadding] = useState(24);\n  const [compRadius, setCompRadius] = useState(24);\n  const [compBorderOpacity, setCompBorderOpacity] = useState(5); // 5% = border-black/5\n\n  const handleReset = () => {\n    setCompPadding(24);\n    setCompRadius(24);\n    setCompBorderOpacity(5);\n  };\n\n  return (\n    <div className=\"h-full flex flex-col lg:flex-row gap-6 animate-fade-in\">\n      {/* COLUMNA IZQUIERDA: Lienzo del Taller */}\n      <div className=\"flex-1 flex flex-col space-y-3\">\n        <div className=\"flex justify-between items-center\">\n          <span className=\"text-[11px] font-bold text-gray-400 uppercase tracking-wider\">\n            Lienzo del Taller (Contraste Grid)\n          </span>\n          <span className=\"text-[10px] font-mono text-[#e056fd] font-bold bg-[#e056fd]/5 px-2 py-0.5 rounded-full border border-[#e056fd]/10\">\n            {compPadding}px • {compRadius}px • {compBorderOpacity}%\n          </span>\n        </div>\n        \n        {/* Fondo cuadriculado para auditar opacidades y transparencias */}\n        <div className=\"flex-1 min-h-[340px] rounded-3xl bg-neutral-100 border border-black/5 relative flex items-center justify-center p-8 overflow-hidden bg-checkerboard dark:bg-neutral-900\">\n          <div \n            className=\"w-full max-w-sm transition-all duration-300 bg-white/80 backdrop-blur-md shadow-soft border\"\n            style={{\n              padding: `${compPadding}px`,\n              borderRadius: `${compRadius}px`,\n              borderColor: `rgba(0, 0, 0, ${compBorderOpacity / 100})`,\n            }}\n          >\n            {/* PREVISUALIZACIÓN REAL DE LOS COMPONENTES CORE */}\n            {selectedComp === 'post' && (\n              <PostFeedCard \n                post={PLAYGROUND_MOCK_POST} \n                variant=\"light\"\n                isTimelineView={false}\n              />\n            )}\n\n            {selectedComp === 'product' && (\n              <ProductCard \n                title={PLAYGROUND_MOCK_PRODUCT.name}\n                price={PLAYGROUND_MOCK_PRODUCT.price}\n                imageUrl={PLAYGROUND_MOCK_PRODUCT.imageUrl}\n                category=\"Tienda Express\"\n                sku={PLAYGROUND_MOCK_PRODUCT.sku}\n              />\n            )}\n\n            {selectedComp === 'create-post' && (\n              <ControlCreatePost \n                isOpen={true}\n                isShellDark={false}\n                jazs={1200} // Desbloquea multimedia\n              />\n            )}\n\n            {selectedComp === 'video' && (\n              <VideoCard \n                videoUrl=\"mov_bbb.mp4\"\n                thumbnailUrl=\"https://picsum.photos/400/600\"\n                title=\"Estilo y Taller de Componentes en Ninjabot\"\n                authorName=\"Muro Ninja\"\n                isTeatro={false}\n              />\n            )}\n          </div>\n        </div>\n      </div>\n\n      {/* COLUMNA DERECHA: Inspectores del Mando */}\n      <div className=\"w-full lg:w-80 flex flex-col space-y-4 flex-shrink-0\">\n        <div className=\"flex justify-between items-center\">\n          <span className=\"text-[11px] font-bold text-gray-400 uppercase tracking-wider\">Mando del Inspector</span>\n          <button onClick={handleReset} className=\"text-[10px] font-semibold text-[#e056fd] hover:underline\">\n            Restablecer\n          </button>\n        </div>\n\n        {/* Selector de Componente Activo */}\n        <div className=\"bg-white p-4 rounded-2xl border border-black/5 space-y-2 shadow-soft\">\n          <label className=\"text-[10px] font-semibold text-gray-500 uppercase tracking-wider block\">\n            Componente\n          </label>\n          <div className=\"grid grid-cols-2 gap-2\">\n            {[\n              { id: 'post', label: 'Post Card' },\n              { id: 'product', label: 'Product Card' },\n              { id: 'create-post', label: 'Input Editor' },\n              { id: 'video', label: 'Video Card' }\n            ].map((comp) => (\n              <button\n                key={comp.id}\n                onClick={() => setSelectedComp(comp.id as TargetComponent)}\n                className={`py-2 px-3 text-center rounded-xl text-xs transition-all duration-200 border font-medium ${\n                  selectedComp === comp.id\n                    ? 'bg-gray-900 text-white border-gray-900'\n                    : 'bg-gray-50 text-gray-600 border-black/5 hover:bg-gray-100'\n                }`}\n              >\n                {comp.label}\n              </button>\n            ))}\n          </div>\n        </div>\n\n        {/* Sliders de Calibración */}\n        <div className=\"bg-white p-4 rounded-2xl border border-black/5 space-y-4 shadow-soft\">\n          {/* Padding Slider */}\n          <div className=\"space-y-1.5\">\n            <div className=\"flex justify-between text-xs font-semibold text-gray-900\">\n              <span>Padding de Tarjeta</span>\n              <span className=\"text-mono text-[#e056fd] font-bold\">{compPadding}px</span>\n            </div>\n            <input \n              type=\"range\" min=\"12\" max=\"32\" value={compPadding}\n              onChange={(e) => setCompPadding(parseInt(e.target.value))}\n              className=\"w-full accent-gray-900 cursor-pointer\"\n            />\n            <div className=\"flex justify-between text-[9px] text-gray-400 font-medium\">\n              <span>Compacto (12px)</span>\n              <span>Relajado (32px)</span>\n            </div>\n          </div>\n\n          {/* Radius Slider */}\n          <div className=\"space-y-1.5\">\n            <div className=\"flex justify-between text-xs font-semibold text-gray-900\">\n              <span>Radio de Esquina</span>\n              <span className=\"text-mono text-[#e056fd] font-bold\">{compRadius}px</span>\n            </div>\n            <input \n              type=\"range\" min=\"8\" max=\"28\" value={compRadius}\n              onChange={(e) => setCompRadius(parseInt(e.target.value))}\n              className=\"w-full accent-gray-900 cursor-pointer\"\n            />\n            <div className=\"flex justify-between text-[9px] text-gray-400 font-medium\">\n              <span>Recto (8px)</span>\n              <span>Orgánico (28px)</span>\n            </div>\n          </div>\n\n          {/* Border Opacity Slider */}\n          <div className=\"space-y-1.5\">\n            <div className=\"flex justify-between text-xs font-semibold text-gray-900\">\n              <span>Opacidad de Borde</span>\n              <span className=\"text-mono text-[#e056fd] font-bold\">{compBorderOpacity}%</span>\n            </div>\n            <input \n              type=\"range\" min=\"0\" max=\"25\" value={compBorderOpacity}\n              onChange={(e) => setCompBorderOpacity(parseInt(e.target.value))}\n              className=\"w-full accent-gray-900 cursor-pointer\"\n            />\n            <div className=\"flex justify-between text-[9px] text-gray-400 font-medium\">\n              <span>Sutil (0%)</span>\n              <span>Definido (25%)</span>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n```\n\n---\n\n### 📄 Archivo 4: `src/demo/uiux/UiUxView.tsx`\n*Responsabilidad:* Orquestador principal de la vista de Apariencia. Incluye la barra de pestañas, administra el estado y bloquea con una tarjeta de seguridad estéticamente pulida si el rol de usuario no coincide con `'admin'`.

```tsx
import React, { useState } from 'react';\nimport { Sliders, Palette, Lock, Layers } from 'lucide-react';\nimport { GlobalTokensInspector } from './components/GlobalTokensInspector';\nimport { ComponentPlayground } from './components/ComponentPlayground';\n\ninterface Profile {\n  id: string;\n  full_name: string;\n  role: 'admin' | 'agent' | string;\n}\n\ninterface UiUxViewProps {\n  profile: Profile | null;\n}\n\nexport const UiUxView: React.FC<UiUxViewProps> = ({ profile }) => {\n  const [activeTab, setActiveTab] = useState<'global' | 'playground'>('global');\n\n  // Doble Defensa de Seguridad\n  const isAdmin = profile?.role === 'admin';\n\n  if (!isAdmin) {\n    return (\n      <div className=\"flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50 text-center h-full\">\n        <div className=\"w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3 border border-red-100\">\n          <Lock className=\"w-5 h-5 text-red-500\" />\n        </div>\n        <h3 className=\"text-xs font-semibold text-gray-900 uppercase tracking-wider\">Acceso Restringido</h3>\n        <p className=\"text-[11px] text-gray-500 max-w-xs mt-1.5 leading-relaxed\">\n          El Estudio del Sistema de Diseño contiene controles sensibles que alteran la materialidad y densidad global de la consola. El acceso está restringido únicamente a administradores.\n        </p>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"h-full flex flex-col overflow-hidden\">\n      {/* Sub-Pestañas de Control */}\n      <div className=\"bg-white border-b border-black/5 px-6 py-2 flex gap-4 flex-shrink-0\">\n        <button\n          onClick={() => setActiveTab('global')}\n          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${\n            activeTab === 'global'\n              ? 'bg-gray-100 text-gray-900 font-medium'\n              : 'text-gray-500 hover:text-gray-900'\n          }`}\n        >\n          <Palette className=\"w-3.5 h-3.5\" />\n          Tokens Globales (Capa 1)\n        </button>\n        <button\n          onClick={() => setActiveTab('playground')}\n          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${\n            activeTab === 'playground'\n              ? 'bg-gray-100 text-gray-900 font-medium'\n              : 'text-gray-500 hover:text-gray-900'\n          }`}\n        >\n          <Layers className=\"w-3.5 h-3.5\" />\n          Inspector de Componentes\n        </button>\n      </div>\n\n      {/* Área del Contenido con Scroll */}\n      <div className=\"flex-1 overflow-hidden p-6\">\n        {activeTab === 'global' ? <GlobalTokensInspector /> : <ComponentPlayground />}\n      </div>\n    </div>\n  );\n};\n```\n\n---\n\n### 📄 Archivo 5: Integración en `src/demo/settings/SettingsN3DetailPanel.tsx`\n*Responsabilidad:* Cargar el orquestador desacoplado `UiUxView` de forma limpia bajo el render condicional del panel central de N3.

```tsx
import React from 'react';\nimport { ArrowLeft } from 'lucide-react';\nimport { SettingsView } from './mockSettings';\nimport { UiUxView } from '../uiux/UiUxView'; // NUEVA IMPORTACIÓN DESACOPLADA\n\ninterface Profile {\n  id: string;\n  full_name: string;\n  role: 'admin' | 'agent' | string;\n}\n\ninterface SettingsN3DetailPanelProps {\n  activeView: SettingsView;\n  profile: Profile | null;\n  onBack?: () => void;\n}\n\nexport const SettingsN3DetailPanel: React.FC<SettingsN3DetailPanelProps> = ({\n  activeView,\n  profile,\n  onBack,\n}) => {\n  return (\n    <div className=\"flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative\">\n      {/* Header Fijo de N3 */}\n      <div className=\"h-16 px-6 bg-white border-b border-black/5 flex items-center justify-between flex-shrink-0\">\n        <div className=\"flex items-center gap-3\">\n          {onBack && (\n            <button onClick={onBack} className=\"md:hidden p-1.5 hover:bg-gray-100 rounded-lg\">\n              <ArrowLeft className=\"w-4 h-4\" />\n            </button>\n          )}\n          <div>\n            <h1 className=\"text-sm font-semibold text-gray-900/90\">\n              {activeView === 'ui_ux' ? 'Estudio de Apariencia' : 'Configuraciones'}\n            </h1>\n            <p className=\"text-[11px] text-gray-500/80\">\n              {activeView === 'ui_ux' \n                ? 'Consola centralizada para auditar consistencia y materialidad' \n                : 'Configura tus opciones generales'}\n            </p>\n          </div>\n        </div>\n      </div>\n\n      {/* Contenedor del Cuerpo Dinámico */}\n      <div className=\"flex-1 overflow-hidden\">\n        {activeView === 'ui_ux' ? (\n          <UiUxView profile={profile} /> // INTEGRACIÓN MODULAR LIMPIA\n        ) : (\n          <div className=\"p-6 text-xs text-gray-400\">Esqueleto de configuración general...</div>\n        )}\n      </div>\n    </div>\n  );\n};\n```\n\n---\n\n## 🚦 3. Verificación de Compilación y Calidad de Código\n\nPara validar la integridad de tipos tras el desacoplamiento de clases y módulos, ejecuta en la consola de tu entorno local:\n\n```bash\nnpx tsc --noEmit; if ($LASTEXITCODE -eq 0) { echo \"TSC_SUCCESS\" } else { echo \"TSC_FAILED:$LASTEXITCODE\" }\n```\n\nAl encapsular los mocks, inspectores de Capa 1 y el lienzo interactivo de Capa 2 en la suite `src/demo/uiux/`, logramos un acoplamiento débil espectacular y garantizamos un mantenimiento fluido a 60 FPS sin interferir con la lógica de negocio del Core de producción.\n