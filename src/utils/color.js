// Utilities to pick readable text/icon color for a given background
// Uses Material's argb utilities for parsing, but computes contrast locally

import { argbFromHex } from '@material/material-color-utilities';

const WHITE_ARGB = 0xffffffff;
const BLACK_ARGB = 0xff000000;

function argbToRgb(argb) {
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return { r, g, b };
}

function relativeLuminance({ r, g, b }) {
  // sRGB to linear
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatioFromArgb(a, b) {
  const la = relativeLuminance(argbToRgb(a));
  const lb = relativeLuminance(argbToRgb(b));
  const [L1, L2] = la > lb ? [la, lb] : [lb, la];
  return (L1 + 0.05) / (L2 + 0.05);
}

function extractFirstHexFromGradient(input) {
  if (typeof input !== 'string') return null;
  const hexMatch = input.match(/#([0-9a-fA-F]{6})/);
  return hexMatch ? `#${hexMatch[1]}` : null;
}

function normalizeHex(input) {
  if (typeof input !== 'string') return null;
  // Expand 3-digit hex to 6-digit
  const short = input.match(/^#([0-9a-fA-F]{3})$/);
  if (short) {
    const s = short[1];
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }
  const long = input.match(/^#([0-9a-fA-F]{6})$/);
  return long ? `#${long[1]}` : null;
}

export function getReadableOnColor(background) {
  if (!background || typeof background !== 'string') return '#000000';

  // Handle gradients by sampling the first hex stop
  const bgCandidate = background.includes('gradient')
    ? extractFirstHexFromGradient(background) || '#ffffff'
    : background;
  const bgHex = normalizeHex(bgCandidate) || '#ffffff';

  const bgArgb = argbFromHex(bgHex);
  const cWhite = contrastRatioFromArgb(bgArgb, WHITE_ARGB);
  const cBlack = contrastRatioFromArgb(bgArgb, BLACK_ARGB);

  // Prefer the color with higher contrast; enforce 4.5:1 target
  if (cBlack >= cWhite) {
    return cBlack >= 4.5 ? '#000000' : (cWhite > cBlack ? '#FFFFFF' : '#000000');
  }
  return cWhite >= 4.5 ? '#FFFFFF' : (cBlack > cWhite ? '#000000' : '#FFFFFF');
}

export function applyOnColorStyle(background) {
  const on = getReadableOnColor(background);
  return { color: on };
}


