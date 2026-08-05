# 📄 Ficha Técnica: Badge Component (`src/components/ui/Badge.tsx`)

## Descripción
Componente UI atómico cromático para contadores, alertas y estados del sistema. Utiliza una degradación de color fluida (Hot, Pending, Cool) con gradientes de Tailwind CSS garantizando alta visibilidad sobre cualquier fondo o icono de canal social.

## Props
| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `type` | `'priority' \| 'pending' \| 'info'` | `'info'` | Define la paleta de gradiente cromático. |
| `count` | `number \| string` | `undefined` | Número a mostrar (formatea `> 99` automáticamente). |
| `label` | `string` | `undefined` | Texto corto opcional. |
| `dotOnly` | `boolean` | `false` | Renderiza solo el punto cromático sin texto. |
| `className`| `string` | `''` | Clases Tailwind adicionales. |

## Variantes Cromáticas
1. **`priority`**: Gradiente Rosa a Naranja para mensajes críticos o de alta prioridad.
2. **`pending`**: Gradiente Naranja a Dorado para chats no leídos o en espera de respuesta.
3. **`info`**: Gradiente Violeta a Cyan para notificaciones e interacciones estándar.