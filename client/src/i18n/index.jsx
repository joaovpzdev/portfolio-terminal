import { createContext, useCallback, useContext, useEffect, useMemo, useState, Fragment } from 'react'
import pt from './pt.json'
import en from './en.json'
import { local } from '../lib/storage.js'

const DICTS = { pt, en }
export const LANGS = Object.keys(DICTS)

function initialLang() {
  const saved = local.get('lang')
  if (LANGS.includes(saved)) return saved
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'pt'
  return nav.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

// Substitui {chave}. Se algum valor for um elemento React, devolve um array renderizável.
export function format(str, vars = {}) {
  const parts = str.split(/\{(\w+)\}/g)
  if (parts.length === 1) return str
  const hasNode = Object.values(vars).some((v) => typeof v === 'object' && v !== null)
  if (!hasNode) return parts.map((p, i) => (i % 2 ? String(vars[p] ?? `{${p}}`) : p)).join('')
  return parts.map((p, i) => <Fragment key={i}>{i % 2 ? (vars[p] ?? `{${p}}`) : p}</Fragment>)
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  const setLang = useCallback((next) => {
    if (!LANGS.includes(next)) return false
    setLangState(next)
    local.set('lang', next)
    return true
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const value = useMemo(() => {
    const dict = DICTS[lang]
    const t = (key, vars) => format(dict[key] ?? pt[key] ?? key, vars)
    return { lang, setLang, t }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n fora do I18nProvider')
  return ctx
}
