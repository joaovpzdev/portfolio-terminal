import { useEffect, useRef, useState } from 'react'
import { complete } from './autocomplete.js'
import { Muted } from './ui.jsx'
import { useI18n } from '../i18n/index.jsx'

export const PROMPT_USER = 'chakal@observations'

export function Prompt() {
  return (
    <span className="select-none">
      <span className="text-phosphor">{PROMPT_USER}</span>
      <span className="text-muted">:</span>
      <span className="text-sky-400">~</span>
      <span className="text-muted">$ </span>
    </span>
  )
}

// Texto selecionado no input não aparece em window.getSelection()
function hasSelection(input) {
  return input.selectionStart !== input.selectionEnd || Boolean(window.getSelection()?.toString())
}

export default function Terminal({ term, commandNames, projectAliases, onActivity, autoFocus = true }) {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [histIdx, setHistIdx] = useState(null)
  const [options, setOptions] = useState([])
  const inputRef = useRef(null)
  const labelRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [term.lines])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  // Sacode o prompt quando o último comando falhou.
  // Reinicia a animação pela classe (sem remontar o input, que perderia o foco).
  const last = term.lines.at(-1)
  useEffect(() => {
    const el = labelRef.current
    if (!last?.error || !el) return
    el.classList.remove('glitch')
    void el.offsetWidth
    el.classList.add('glitch')
  }, [last])

  function submit() {
    term.execute(input)
    setInput('')
    setHistIdx(null)
    setOptions([])
  }

  function onKeyDown(e) {
    onActivity?.()
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const res = complete(input, { commandNames, projectAliases })
      setInput(res.value)
      setOptions(res.options.length > 1 ? res.options : [])
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = term.history
      if (!h.length) return
      const idx = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(idx)
      setInput(h[idx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = term.history
      if (histIdx === null) return
      const idx = histIdx + 1
      if (idx >= h.length) {
        setHistIdx(null)
        setInput('')
      } else {
        setHistIdx(idx)
        setInput(h[idx])
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      term.clear()
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c' && !hasSelection(e.currentTarget)) {
      e.preventDefault()
      term.push({ input: input + '^C' })
      setInput('')
    }
  }

  // Clique em área vazia foca o input, sem atrapalhar seleção de texto
  function focusIfNoSelection(e) {
    if (e.target.closest('a,button,input')) return
    if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" onClick={focusIfNoSelection}>
      <div
        className="term-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2 text-sm leading-relaxed sm:px-6 sm:text-[15px]"
        role="log"
        aria-live="polite"
        aria-label="terminal"
      >
        {term.lines.map((l) => (
          <div key={l.id} className="mb-3 break-words">
            {l.input !== undefined && (
              <div>
                <Prompt />
                <span>{l.input}</span>
              </div>
            )}
            {l.out && <div className="mt-1">{l.out}</div>}
          </div>
        ))}
        {options.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-x-4">
            {options.map((o) => (
              <Muted key={o}>{o}</Muted>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <label ref={labelRef} className="flex items-center border-t border-line px-4 py-3 text-sm sm:px-6 sm:text-[15px]">
        <Prompt />
        <span className="sr-only">{t('term.inputLabel')}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          maxLength={200}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-transparent text-phosphor caret-phosphor outline-none"
          aria-label={t('term.inputLabel')}
        />
      </label>
    </div>
  )
}
