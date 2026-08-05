/**
 * @module ChannelConfig
 * @description Configuración de canales/redes sociales para el feed N2.
 * Proporciona colores, iconos y etiquetas para cada red social.
 */

import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export interface ChannelConfigItem {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

export const CHANNEL_CONFIG: Record<string, ChannelConfigItem> = {
  facebook: {
    label: 'Facebook',
    icon: <FaFacebook className="w-3 h-3" />,
    bgColor: '#1877F2',
    textColor: '#FFFFFF',
  },
  twitter: {
    label: 'X',
    icon: <FaTwitter className="w-3 h-3" />,
    bgColor: '#1DA1F2',
    textColor: '#FFFFFF',
  },
  instagram: {
    label: 'Instagram',
    icon: <FaInstagram className="w-3 h-3" />,
    bgColor: '#DD2A7B',
    textColor: '#FFFFFF',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <FaLinkedinIn className="w-3 h-3" />,
    bgColor: '#0A66C2',
    textColor: '#FFFFFF',
  },
};