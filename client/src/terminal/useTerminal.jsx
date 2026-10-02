import { useCallback, useRef, useState } from 'react'
import { parse } from './parser.js'
import { closest } from './suggest.js'
import { Cmd, Err, Muted } from './ui.jsx'
import { searchProjects } from '../lib/search.js'
import { projects } from '../commands/index.jsx'

let nextId = 1

// Estado e execução do terminal. A UI (Terminal.jsx) só desenha o que sai daqui.
export function useTerminal({ registry, t, lang, setLang, openMap, reboot, hint, intro }) {
  const [lines, setLines] = useState(() => [{ id: nextId++, out: intro }])
  const [history, setHistory] = useState([])
  const cleared = useRef(false)

  const clear = useCallback(() => {
    cleared.current = true
    setLines([])
  }, [])

  const push = useCallback((entry) => setLines((prev) => [...prev, { id: nextId++, ...entry }].slice(-200)), [])

  const execute = useCallback(
    (raw) => {
      const line = String(raw ?? '').trim()
      const parsed = parse(line)
      const newHistory = line ? [...history, line].slice(-100) : history
      if (line) setHistory(newHistory)

      if (!parsed.name) {
        push({ input: '' })
        return
      }

      cleared.current = false
      let out
      let error = false
      const cmd = registry.get(parsed.name)

      try {
        if (cmd) {
          out = cmd.run({
            ...parsed,
            t,
            lang,
            setLang,
            registry,
            openMap,
            reboot,
            hint,
            clear,
            history: newHistory,
          })
        } else {
          ;({ out, error } = unknown(parsed, line))
        }
      } catch (err) {
        console.error(err)
        out = <Err>error: {String(err.message ?? err)}</Err>
        error = true
      }

      if (!cleared.current) push({ input: line, out, error })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registry, t, lang, setLang, openMap, reboot, hint, clear, history, push],
  )

  // Comando desconhecido: vira busca nos projetos; sem resultado, sugere o comando mais próximo
  function unknown(parsed, line) {
    const found = searchProjects(projects, line, lang)
    if (found.length) return { out: registry.get('search').run({ args: [line], flags: {}, t, lang }), error: false }

    // '?' fica de fora: qualquer palavra de 1-2 letras estaria a distância <= 2 dele
    const suggestion = closest(parsed.name, registry.names().filter((n) => n.length > 1))
    const out = (
      <div>
        <Err>{t('term.notFound', { cmd: parsed.name })}</Err> <Muted>·</Muted>{' '}
        {suggestion
          ? t('term.didYouMean', { cmd: <Cmd>{suggestion}</Cmd> })
          : t('term.start', { cmd: <Cmd>help</Cmd>, map: <Cmd>map</Cmd> })}
      </div>
    )
    return { out, error: true }
  }

  return { lines, history, execute, clear, push }
}
