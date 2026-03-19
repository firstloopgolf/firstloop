// ── FIRST LOOP — Theme Definitions ───────────────────────────
// All colour tokens for both modes live here.
// Never import this file directly in components.
// Use: const { B, serif, sans } = useTheme()

// ── Typography ────────────────────────────────────────────────
export const serif = "'DM Serif Display', Georgia, serif"
export const sans  = "'DM Sans', system-ui, sans-serif"

// ── Light Mode ────────────────────────────────────────────────
export const lightColors = {
  // Primary surfaces
  navy:       '#1a2e1a',
  navyLight:  '#2d5a27',
  navyDark:   '#0f1f0f',

  // Brand greens
  green:      '#2d5a27',
  greenLight: '#4a9040',

  // Gold
  gold:       '#c9a84c',
  goldLight:  '#e8c96d',
  goldPale:   '#f5edd6',

  // Backgrounds
  cream:      '#f5f0e8',
  creamDark:  '#ede8de',
  white:      '#ffffff',
  feedBg:     '#f0ebe0',

  // Text
  textNavy:   '#1c1c1e',   // near-black — primary text
  textMid:    '#5a5a5a',   // secondary text
  textSoft:   '#8a8a8a',   // muted / metadata

  // Border
  border:     'rgba(212,196,160,0.6)',
}

// ── Dark Mode ─────────────────────────────────────────────────
export const darkColors = {
  // Primary surfaces
  navy:       '#151f15',
  navyLight:  '#1a2e1a',
  navyDark:   '#0e140e',

  // Brand greens
  green:      '#2d5a27',
  greenLight: '#6db562',

  // Gold
  gold:       '#c9a84c',
  goldLight:  '#e8c96d',
  goldPale:   'rgba(201,168,76,0.12)',

  // Backgrounds
  cream:      '#e8e4da',   // warm off-white — primary text on dark
  creamDark:  '#1a261a',   // dark card surface
  white:      '#1a261a',   // cards in dark mode
  feedBg:     '#0e140e',   // page base

  // Text — all bumped up significantly for dark mode legibility
  textNavy:   '#e8e4da',   // primary — warm off-white (unchanged)
  textMid:    '#b8b0a0',   // secondary — was #9a9080, now much more readable
  textSoft:   '#8a8070',   // muted — was #5a5448 (nearly invisible), now legible

  // Border
  border:     'rgba(74,144,64,0.2)',
}