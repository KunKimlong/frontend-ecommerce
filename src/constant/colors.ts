/* =============================================
   🎨 COLOR PALETTE — JS-side exports
   Keep in sync with :root variables in globals.css
   Change values here & there to rebrand.
   ============================================= */
export const colors = {
  brand: {
    25: '#f2f7ff',
    50: '#ecf3ff',
    100: '#dde9ff',
    200: '#c2d6ff',
    300: '#9cb9ff',
    400: '#7592ff',
    500: '#465fff',
    600: '#3641f5',
    700: '#2a31d8',
    800: '#252dae',
    900: '#262e89',
    950: '#161950',
  },
  primary: '#465fff',
  primaryLight: '#9cb9ff',
  secondary: '#667085',
  gray: {
    200: '#e4e7ec',
    300: '#d0d5dd',
    500: '#667085',
    700: '#344054',
  },
  white: '#ffffff',
  success: {
    500: '#12b76a',
  },
  error: {
    500: '#f04438',
  },
} as const;
