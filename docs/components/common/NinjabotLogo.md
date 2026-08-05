# 📄 Ficha Técnica: NinjabotLogo Component (`src/components/common/NinjabotLogo.tsx`)

## Descripción
Logo oficial de la entidad Ninjabot. Componente `[Brand]` reutilizable que centraliza el uso del logotipo en toda la aplicación. Utiliza el barril `src/assets/ninjabot` como único origen de verdad para las variantes del logo (formato **SVG** oficial basado en el `favicon.svg`), garantizando consistencia visual y un solo punto de cambio.

## Props
| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `variant` | `'color' \| 'blanco' \| 'negro'` | `'color'` | Variante del logotipo según el fondo. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Tamaño estándar del logo. |
| `className` | `string` | `''` | Clases Tailwind adicionales. |
| `alt` | `string` | `'Ninjabot'` | Texto alternativo accesible. |

## Variantes
1. **`color`**: Logo principal a color. Usar sobre fondos claros.
2. **`blanco`**: Logo blanco. Usar sobre fondos oscuros/negros.
3. **`negro`**: Logo negro. Usar sobre fondos muy claros.

## Tamaños Estándar
| Size | Clases CSS | Uso típico |
|---|---|---|
| `xs` | `w-3 h-3` | Avatar de mensajes |
| `sm` | `w-5 h-5` | Headers compactos, botones |
| `md` | `w-7 h-7` | Headers generales |
| `lg` | `w-10 h-10` | Sidebars |
| `xl` | `w-14 h-14` | Login |
| `2xl` | `w-20 h-20` | Hero / branding grande |

## Ejemplos de Uso
```tsx
<NinjabotLogo />
<NinjabotLogo variant="blanco" size="lg" />
<NinjabotLogo size="sm" className="rounded-full" />
<NinjabotLogo variant="blanco" size="2xl" className="w-full h-full sm:w-24 sm:h-24" />
```

## Uso de la Entidad Ninjabot
1. **Importar**: `import { NinjabotLogo } from '../../components/common/NinjabotLogo';`
2. **Seleccionar `variant`** según el fondo del contenedor.
3. **Seleccionar `size`** según el contexto visual.
4. **Agregar `className`** solo para ajustes puntuales.

## Convenciones
- **NUNCA** importar PNGs directamente desde `src/assets/ninjabot/`; usar `NinjabotLogo` o el barril `NINJABOT_LOGO`.
- **NUNCA** aplicar filtros CSS (`brightness-0 invert`) para cambiar el color; usar la variante correspondiente.
- Si se agrega una nueva variante, actualizar el barril y el tipo `NinjabotLogoVariant`.