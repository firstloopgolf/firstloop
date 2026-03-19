// ── FIRST LOOP — Theme Definitions ───────────────────────────
// All colour tokens for both modes live here.
// Never import this file directly in components.
// Use: const { B, serif, sans } = useTheme()

// ── Typography ────────────────────────────────────────────────
export const serif = "'DM Serif Display', Georgia, serif"
export const sans  = "'DM Sans', system-ui, sans-serif"

// ── Light Mode ────────────────────────────────────────────────
// Warm cream base, green-dominant, gold accents.
// Feels like a members' scorecard in afternoon light.
export const lightColors = {
  // Primary surfaces
  navy:       '#1a2e1a',   // deep green — replaces old navy everywhere
  navyLight:  '#2d5a27',   // mid green
  navyDark:   '#0f1f0f',   // darkest green

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
// Near-black with green tint. Gold does more work.
// Feels like a course at dusk — confident, editorial.
export const darkColors = {
  // Primary surfaces
  navy:       '#151f15',   // dark green surface — nav, hero, banners
  navyLight:  '#1a2e1a',   // slightly lighter surface
  navyDark:   '#0e140e',   // deepest — page background

  // Brand greens
  green:      '#2d5a27',
  greenLight: '#6db562',   // brighter in dark — needs more contrast

  // Gold (unchanged — gold pops equally in both modes)
  gold:       '#c9a84c',
  goldLight:  '#e8c96d',
  goldPale:   'rgba(201,168,76,0.12)',

  // Backgrounds
  cream:      '#e8e4da',   // warm off-white text on dark surfaces
  creamDark:  '#1a261a',   // dark card surface
  white:      '#1a261a',   // "white" cards are dark in dark mode
  feedBg:     '#0e140e',   // page base

  // Text
  textNavy:   '#e8e4da',   // primary text — warm off-white
  textMid:    '#9a9080',   // secondary
  textSoft:   '#5a5448',   // muted

  // Border
  border:     'rgba(74,144,64,0.2)',
}
