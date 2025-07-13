'use client';

import { Button, createTheme } from '@mantine/core';
import buttonVariants from './ButtonVariants.module.css';

import './globals.css';

export const theme = createTheme({
  /* Put your mantine theme override here */
  spacing: {
    xxs: '4px',
  },
  
  colors: {
    brandViolet: [
      '#f6eeff',
      '#e7d9f7',
      '#cab1ea',
      '#ad86dd',
      '#9462d2',
      '#854bcb',
      '#7d3fc9',
      '#6b31b2',
      '#5f2ba0',
      '#52238d',
    ],
    brandGreen: [
      '#e6ffee',
      '#d3f9e0',
      '#a8f2c0',
      '#7aea9f',
      '#54e382',
      '#3bdf70',
      '#2bdd66',
      '#1bc455',
      '#0bae4a',
      '#00973c',
    ],
  },

  components: {
    Button: Button.extend({ classNames: buttonVariants }),
  },
});
