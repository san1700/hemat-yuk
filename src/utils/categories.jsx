import React from 'react';
import { Utensils, Bus, ShoppingBag, Coffee, GraduationCap, Gamepad2, AlertCircle, Cookie } from 'lucide-react';

export const CATEGORY_CONFIG = {
  Food: {
    color: '#f43f5e', // Rose
    icon: <Utensils size={18} />,
    label: 'Food'
  },
  Transport: {
    color: '#f59e0b', // Amber
    icon: <Bus size={18} />,
    label: 'Transport'
  },
  Shopping: {
    color: '#10b981', // Emerald
    icon: <ShoppingBag size={18} />,
    label: 'Shopping'
  },
  Coffee: {
    color: '#8b5cf6', // Violet
    icon: <Coffee size={18} />,
    label: 'Coffee'
  },
  Edu: {
    color: '#0ea5e9', // Sky
    icon: <GraduationCap size={18} />,
    label: 'Edu'
  },
  Lifestyle: {
    color: '#f97316', // Orange
    icon: <Gamepad2 size={18} />,
    label: 'Lifestyle'
  },
  Snacks: {
    color: '#ec4899', // Pink
    icon: <Cookie size={18} />,
    label: 'Snacks'
  },
  Default: {
    color: '#cbd5e1', // Slate light
    icon: <AlertCircle size={18} />,
    label: 'Lainnya'
  }
};
