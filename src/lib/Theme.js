// ── FIRST LOOP — Theme Definitions ───────────────────────────
// All colour tokens for both modes live here.
// Never import this file directly in components.
// Use: const { B, serif, sans } = useTheme()

// ── Typography ────────────────────────────────────────────────
export const serif = "'DM Serif Display', Georgia, serif"
export const sans  = "'DM Sans', system-ui, sans-serif"

// ── Light Mode ────────────────────────────────────────────────
export const lightColors = {
  navy:       '#1a2e1a',
  navyLight:  '#2d5a27',
  navyDark:   '#0f1f0f',
  green:      '#2d5a27',
  greenLight: '#4a9040',
  gold:       '#c9a84c',
  goldLight:  '#e8c96d',
  goldPale:   '#f5edd6',
  cream:      '#f5f0e8',
  creamDark:  '#ede8de',
  white:      '#ffffff',
  feedBg:     '#f0ebe0',
  textNavy:   '#1c1c1e',
  textMid:    '#5a5a5a',
  textSoft:   '#8a8a8a',
  border:     'rgba(212,196,160,0.6)',
}

// ── Dark Mode ─────────────────────────────────────────────────
export const darkColors = {
  navy:       '#151f15',
  navyLight:  '#1a2e1a',
  navyDark:   '#0e140e',
  green:      '#2d5a27',
  greenLight: '#6db562',
  gold:       '#c9a84c',
  goldLight:  '#e8c96d',
  goldPale:   'rgba(201,168,76,0.12)',
  cream:      '#e8e4da',
  creamDark:  '#1a261a',
  white:      '#1a261a',
  feedBg:     '#0e140e',
  // Text — high contrast for dark backgrounds
  textNavy:   '#e8e4da',   // primary — warm off-white
  textMid:    '#c4bdb0',   // secondary — bumped up from #b8b0a0
  textSoft:   '#a09888',   // muted — bumped up from #8a8070, was #5a5448
  border:     'rgba(74,144,64,0.2)',
}