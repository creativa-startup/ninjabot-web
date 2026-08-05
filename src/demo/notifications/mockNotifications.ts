/**
 * @module mockNotifications
 * @description Datos wireframe (mock) del Módulo de Notificaciones — Etapa 2.
 */

export type NotificationCategory = 'chat' | 'comentario' | 'venta' | 'sistema' | 'lead';

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  category: NotificationCategory;
  read: boolean;
  channelLabel?: string;
  actionLabel?: string;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: 'notif-1', title: 'Nuevo mensaje de María Fernanda', message: 'Hola, ¿me puedes ayudar con mi pedido #1024?', time: 'hace 2 minutos', category: 'chat', read: false, channelLabel: 'WhatsApp', actionLabel: 'Responder' },
  { id: 'notif-2', title: 'Nuevo comentario en tu Jaz', message: '@cafearoma_ec comentó: "¡Increíble contenido! 🚀"', time: 'hace 15 minutos', category: 'comentario', read: false, channelLabel: 'Instagram', actionLabel: 'Ver comentario' },
  { id: 'notif-3', title: 'Venta concretada 💰', message: 'Se registró una venta de $49.90 por el plan Esencial.', time: 'hace 1 hora', category: 'venta', read: false, channelLabel: 'Ninjabot', actionLabel: 'Ver detalle' },
  { id: 'notif-4', title: 'Nuevo lead capturado', message: 'Carlos Andrade completó el formulario "Solicita una demo".', time: 'hace 3 horas', category: 'lead', read: true, channelLabel: 'Facebook', actionLabel: 'Contactar' },
  { id: 'notif-5', title: 'Mensaje de Lucía Pérez', message: '¿Cuándo hay disponibilidad para la próxima semana?', time: 'hace 4 horas', category: 'chat', read: true, channelLabel: 'Messenger', actionLabel: 'Responder' },
  { id: 'notif-6', title: 'Mantenimiento programado', message: 'El sistema estará en mantenimiento el domingo 2:00 AM por 30 minutos.', time: 'hace 6 horas', category: 'sistema', read: true },
  { id: 'notif-7', title: 'Nuevo seguidor', message: 'TechNova Solutions comenzó a seguir tu perfil público.', time: 'hace 1 día', category: 'sistema', read: true, actionLabel: 'Ver perfil' },
  { id: 'notif-8', title: 'Venta concretada 💰', message: 'Se registró una venta de $29.90 por el plan Starter.', time: 'hace 2 días', category: 'venta', read: true, channelLabel: 'Ninjabot', actionLabel: 'Ver detalle' },
];

export default DEMO_NOTIFICATIONS;