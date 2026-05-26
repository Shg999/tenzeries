import { Dimensions, PixelRatio } from 'react-native';

// Get current screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference dimensions (standard phone)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scale factors
const scaleWidth = SCREEN_WIDTH / guidelineBaseWidth;
const scaleHeight = SCREEN_HEIGHT / guidelineBaseHeight;
const scale = Math.min(scaleWidth, scaleHeight);

/**
 * Width-based scaling - for horizontal sizes
 * @param {number} size - size in design pixels
 */
export const wp = (size) => {
  return Math.round(size * scaleWidth);
};

/**
 * Height-based scaling - for vertical sizes
 * @param {number} size - size in design pixels
 */
export const hp = (size) => {
  return Math.round(size * scaleHeight);
};

/**
 * Font scaling - balanced scaling for text
 * @param {number} size - font size in design pixels
 */
export const fp = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scaling - balanced for spacing/padding
 * @param {number} size - size value
 * @param {number} factor - scaling intensity (0-1)
 */
export const mp = (size, factor = 0.5) => {
  return Math.round(size + (scaleWidth - 1) * size * factor);
};

/**
 * Uniform scaling - same scale for width & height
 * @param {number} size - size value
 */
export const sp = (size) => {
  return Math.round(size * scale);
};

/**
 * Border radius scaling
 */
export const br = (size) => {
  return Math.round(size * scale);
};

// Device checks
export const isSmallDevice = SCREEN_WIDTH < 350;
export const isTablet = SCREEN_WIDTH >= 600;

/**
 * Responsive value picker
 */
export const responsive = (small, medium, large) => {
  if (isSmallDevice) return small;
  if (isTablet) return large || medium;
  return medium;
};

// Screen info
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export default {
  wp,
  hp,
  fp,
  sp,
  mp,
  br,
  responsive,
  isSmallDevice,
  isTablet,
  screen,
};
