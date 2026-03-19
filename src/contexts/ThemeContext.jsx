import { createContext, useContext, useEffect, useState } from 'react'
import { lightColors, darkColors, serif, sans } from '../lib/Theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Respect saved user preference
    const saved = localStorage.getItem('fl-theme')
    if (saved === 'dark' || saved === 'light') return saved
    // 2. Respect OS preference on first visit
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Apply data-theme to <html> so CSS variables in index.css stay in sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fl-theme', theme)
  }, [theme])

  // Follow OS preference changes only if the user hasn't manually chosen
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      const saved = localStorage.getItem('fl-theme')
      if (!saved) setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () =>
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  const isDark = theme === 'dark'

  // B is the same key shape as the original — drop-in replacement
  const B = isDark ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ B, serif, sans, theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}