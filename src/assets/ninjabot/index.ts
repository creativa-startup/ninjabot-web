/**
 * @module assets/ninjabot
 * @description Barril central de la marca Ninjabot.
 * Único punto de referencia para las variantes del logotipo.
 */

import logoColor from './ninjabot-logo.svg';
import logoBlanco from './ninjabot-logo-blanco.svg';
import logoNegro from './ninjabot-logo-negro.svg';

export const NINJABOT_LOGO = {
  color: logoColor,
  blanco: logoBlanco,
  negro: logoNegro,
} as const;

export type NinjabotLogoVariant = keyof typeof NINJABOT_LOGO;