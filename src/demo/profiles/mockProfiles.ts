/**
 * @module mockProfiles
 * @description Datos wireframe (mock) del Módulo de Perfiles — Etapa 2.
 * Array de empresas demo autocontenido para el esqueleto visual de
 * ProfilesN2ListPanel (Panel N2 — Directorio) y ProfilesN3DetailPanel
 * (Panel N3 — Perfil Público Inmersivo).
 *
 * Cada perfil incluye estadísticas agregadas (ninjats/likes/shares) y
 * un histórico de publicaciones (posts) con métricas propias.
 */

export interface DemoProfilePost {
  id: string;
  content: string;
  timestamp: string;
  channel: 'instagram' | 'whatsapp' | 'messenger' | 'ninjabot';
  metrics: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface DemoBusinessProfile {
  id: string;
  name: string;
  handle: string;
  category: 'Agencia' | 'Retail' | 'Food' | 'Tech' | 'Fitness';
  location: string;
  website?: string;
  bio: string;
  followers: number;
  verified?: boolean;
  stats: {
    ninjats: number;
    likes: number;
    shares: number;
  };
  posts: DemoProfilePost[];
}

export const DEMO_BUSINESS_PROFILES: DemoBusinessProfile[] = [
  {
    id: 'profile-1',
    name: 'Creativa Studio',
    handle: '@creativa_studio',
    category: 'Agencia',
    location: 'Quito, Ecuador',
    website: 'creativa.studio',
    bio: 'Agencia creativa especializada en Social Commerce y automatización con IA. Ayudamos a marcas a vender conversacionalmente. 🚀',
    followers: 12800,
    verified: true,
    stats: {
      ninjats: 42,
      likes: 12500,
      shares: 3200,
    },
    posts: [
      {
        id: 'pp1-1',
        content: 'El Social Commerce está transformando cómo las marcas venden: ¡el futuro es conversacional! 🚀 #SocialCommerce #Ventas',
        timestamp: 'hace 2 horas',
        channel: 'instagram',
        metrics: { likes: 234, comments: 18, shares: 45 },
      },
      {
        id: 'pp1-2',
        content: 'Lanzamos nuevo flujo de automatización para recuperar carritos abandonados. +23% de conversión 📈',
        timestamp: 'hace 5 horas',
        channel: 'instagram',
        metrics: { likes: 189, comments: 12, shares: 67 },
      },
      {
        id: 'pp1-3',
        content: 'Consejo Ninja: personaliza tus respuestas con el contexto del cliente para cerrar más ventas. 💡',
        timestamp: 'hace 1 día',
        channel: 'whatsapp',
        metrics: { likes: 320, comments: 24, shares: 98 },
      },
    ],
  },
  {
    id: 'profile-2',
    name: 'Café Aroma',
    handle: '@cafearoma_ec',
    category: 'Food',
    location: 'Quito, Ecuador',
    website: 'cafearoma.ec',
    bio: 'Café de especialidad tostado en Ecuador. Granos 100% arábica de altura. Ven a probar nuestra nueva carta de temporada ☕',
    followers: 8600,
    stats: {
      ninjats: 28,
      likes: 7300,
      shares: 1100,
    },
    posts: [
      {
        id: 'pp2-1',
        content: 'Nueva carta de temporada: café de origen Loja con notas a chocolate y naranja. 🍊☕',
        timestamp: 'hace 3 horas',
        channel: 'instagram',
        metrics: { likes: 156, comments: 9, shares: 12 },
      },
      {
        id: 'pp2-2',
        content: 'Taller de barismo este sábado. Cupos limitados — escribe "TALLER" para reservar tu lugar. ✨',
        timestamp: 'hace 1 día',
        channel: 'whatsapp',
        metrics: { likes: 98, comments: 14, shares: 23 },
      },
    ],
  },
  {
    id: 'profile-3',
    name: 'TechNova Solutions',
    handle: '@technova_sol',
    category: 'Tech',
    location: 'Guayaquil, Ecuador',
    website: 'technova.dev',
    bio: 'Desarrollo de software y transformación digital. Construimos productos que escalan: apps, APIs y automatización empresarial. 💻',
    followers: 15200,
    verified: true,
    stats: {
      ninjats: 56,
      likes: 18900,
      shares: 5400,
    },
    posts: [
      {
        id: 'pp3-1',
        content: 'Integramos tu negocio con WhatsApp Business API + IA. Automatiza ventas 24/7 sin perder el toque humano. 🤖💬',
        timestamp: 'hace 4 horas',
        channel: 'messenger',
        metrics: { likes: 412, comments: 31, shares: 145 },
      },
      {
        id: 'pp3-2',
        content: 'Caso de éxito: +40% de eficiencia operativa con nuestro sistema de ticketing inteligente. 📊',
        timestamp: 'hace 8 horas',
        channel: 'instagram',
        metrics: { likes: 267, comments: 15, shares: 89 },
      },
      {
        id: 'pp3-3',
        content: 'Webinars gratuitos cada jueves. Esta semana: "IA aplicada a ventas conversacionales". 🎓',
        timestamp: 'hace 2 días',
        channel: 'ninjabot',
        metrics: { likes: 178, comments: 22, shares: 54 },
      },
    ],
  },
  {
    id: 'profile-4',
    name: 'Módena Fashion',
    handle: '@modena_fashion',
    category: 'Retail',
    location: 'Cuenca, Ecuador',
    website: 'modena.ec',
    bio: 'Moda sostenible para la mujer moderna. Prendas únicas, ediciones limitadas y envíos a todo Ecuador. 👗✨',
    followers: 19300,
    verified: true,
    stats: {
      ninjats: 38,
      likes: 21500,
      shares: 6200,
    },
    posts: [
      {
        id: 'pp4-1',
        content: 'Colección primavera-verano ya disponible. Prueba virtual con IA en nuestra tienda 🔥👗',
        timestamp: 'hace 1 hora',
        channel: 'instagram',
        metrics: { likes: 534, comments: 42, shares: 178 },
      },
      {
        id: 'pp4-2',
        content: 'Liquidación de temporada: hasta 50% OFF en seleccionadas. Stock limitado — escríbenos "OFERTA" 📦💥',
        timestamp: 'hace 6 horas',
        channel: 'whatsapp',
        metrics: { likes: 289, comments: 36, shares: 210 },
      },
    ],
  },
  {
    id: 'profile-5',
    name: 'FitZone Gym',
    handle: '@fitzone_gym',
    category: 'Fitness',
    location: 'Manta, Ecuador',
    website: 'fitzone.ec',
    bio: 'Entrenamiento funcional, cross training y nutrición deportiva. Tu mejor versión empieza aquí. 💪🔥',
    followers: 7400,
    stats: {
      ninjats: 21,
      likes: 5100,
      shares: 900,
    },
    posts: [
      {
        id: 'pp5-1',
        content: 'Reto 30 días: transformación total. Inscripciones abiertas esta semana únicamente. 🏆',
        timestamp: 'hace 2 horas',
        channel: 'instagram',
        metrics: { likes: 143, comments: 11, shares: 34 },
      },
      {
        id: 'pp5-2',
        content: 'Nueva zona de cross training equipada. Primer mes con 20% de descuento. 🏋️‍♂️',
        timestamp: 'hace 1 día',
        channel: 'whatsapp',
        metrics: { likes: 87, comments: 6, shares: 15 },
      },
    ],
  },
];

export default DEMO_BUSINESS_PROFILES;