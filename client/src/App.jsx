import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './i18n/index.jsx'
import { session, local } from './lib/storage.js'
import { createRegistry } from './terminal/registry.js'
import { useTerminal } from './terminal/useTerminal.jsx'
import Terminal from './terminal/Terminal.jsx'
import { TerminalActions, Cmd, Muted } from './terminal/ui.jsx'
import { COMMANDS, projects } from './commands/index.jsx'
import { RESUMES } from './data/profile.js'
import BootScreen from './boot/BootScreen.jsx'
import CommandMap from './hints/CommandMap.jsx'
import WelcomePopup from './hints/WelcomePopup.jsx'
import { Analytics } from "@vercel/analytics/react";

const registry = createRegistry(COMMANDS)
const commandNames = registry.list().map((c) => c.name)
const projectAliases = projects.map((p) => p.alias)
const QUICK = ['help', 'ls projects', 'whoami', 'resume --red', 'resume --blue', 'contact', 'map']
const IDLE_MS = 20000

function Intro() {
  const { t } = useI18n()
  return (
    <div className="space-y-1">
      <div className="glow font-bold tracking-widest">CHAKAL OBSERVATIONS</div>
      <div>{t('term.welcome')}</div>
      <div>{t('term.start', { cmd: <Cmd>help</Cmd>, map: <Cmd>map</Cmd> })}</div>
    </div>
  )
}

function TerminalApp({ onReboot }) {
  const { t, lang, setLang } = useI18n()
  const [mapOpen, setMapOpen] = useState(false)
  const [welcome, setWelcome] = useState(() => local.get('welcome.hidden') !== '1')
  const [toast, setToast] = useState(null)
  const shownHints = useRef(new Set())
  const idleTimer = useRef(null)
  const idleIdx = useRef(0)

  const openMap = useCallback(() => setMapOpen(true), [])

  // Dica contextual: cada uma aparece uma vez por sessão
  const hint = useCallback((key, vars) => {
    if (shownHints.current.has(key)) return
    shownHints.current.add(key)
    setToast({ key, vars, id: Date.now() })
  }, [])

  const term = useTerminal({ registry, t, lang, setLang, openMap, reboot: onReboot, hint, intro: <Intro /> })
  const run = term.execute

  // Dica rotativa depois de 20 s sem digitar
  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      const i = idleIdx.current++ % 4
      const vars = [{ cmd: 'map' }, {}, { cmd: 'resume --red' }, {}][i]
      setToast({ key: `hint.idle.${i}`, vars, id: Date.now() })
      resetIdle()
    }, IDLE_MS)
  }, [])

  useEffect(() => {
    resetIdle()
    return () => clearTimeout(idleTimer.current)
  }, [resetIdle])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 7000)
    return () => clearTimeout(id)
  }, [toast])

  // F1 abre o mapa em qualquer lugar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F1') {
        e.preventDefault()
        setMapOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const actions = useMemo(() => ({ run }), [run])
  const toastVars = toast?.vars
    ? Object.fromEntries(Object.entries(toast.vars).map(([k, v]) => [k, v.includes('<') ? <code className="text-amber">{v}</code> : <Cmd>{v}</Cmd>]))
    : undefined

  return (
    <TerminalActions.Provider value={actions}>
      <div className="flex h-dvh flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 text-xs sm:px-6 sm:text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-phosphor shadow-[0_0_8px_#33ff66]" aria-hidden />
            <span className="truncate text-muted">chakal@observations — /home/portfolio</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => run(lang === 'pt' ? 'lang en' : 'lang pt')}
              className="border border-line px-2 py-0.5 text-muted hover:border-phosphor hover:text-phosphor"
              aria-label={lang === 'pt' ? 'Switch to English' : 'Mudar para português'}
            >
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
            <details className="relative">
              <summary className="cursor-pointer list-none border border-amber px-2 py-0.5 text-amber hover:bg-amber hover:text-void">
                {t('ui.resume')}
              </summary>
              <div className="absolute right-0 z-30 mt-1 w-40 border border-line bg-panel">
                {Object.entries(RESUMES).map(([key, r]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.closest('details').open = false
                      run(`resume --${key}`)
                    }}
                    className={`block w-full px-3 py-2 text-left hover:bg-phosphor/10 ${key === 'red' ? 'text-alert' : 'text-sky-400'}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </details>
            <button
              type="button"
              onClick={openMap}
              className="h-7 w-7 border border-phosphor-dim text-phosphor hover:bg-phosphor hover:text-void"
              aria-label={t('ui.help')}
              title={t('ui.help')}
            >
              ?
            </button>
          </div>
        </header>

        <Terminal
          term={term}
          commandNames={commandNames}
          projectAliases={projectAliases}
          onActivity={resetIdle}
          autoFocus={!welcome}
        />

        {/* Atalhos: no celular digitar é lento */}
        <nav aria-label={t('ui.quick')} className="term-scroll flex gap-2 overflow-x-auto border-t border-line px-4 py-2 sm:hidden">
          {QUICK.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => run(c)}
              className="shrink-0 border border-line px-2 py-1 text-xs text-amber active:bg-amber active:text-void"
            >
              {c}
            </button>
          ))}
        </nav>

        {toast && !welcome && !mapOpen && (
          <div
            key={toast.id}
            role="status"
            className="fixed top-14 right-4 left-4 z-30 border border-line bg-panel px-4 py-3 text-sm shadow-lg sm:left-auto sm:max-w-sm"
          >
            <Muted>{t('hint.title')} › </Muted>
            {t(toast.key, toastVars)}
          </div>
        )}

        {welcome && (
          <WelcomePopup
            onRun={run}
            onClose={(hideNext) => {
              if (hideNext) local.set('welcome.hidden', '1')
              setWelcome(false)
            }}
          />
        )}

        <CommandMap open={mapOpen} onClose={() => setMapOpen(false)} onRun={run} />
      </div>
    </TerminalActions.Provider>
  )
}

export default function App() {
  // O loading completo roda só na primeira visita da sessão; `reboot` repete
  const [booting, setBooting] = useState(() => session.get('booted') !== '1')
  const [bootKey, setBootKey] = useState(0)

  const done = useCallback(() => {
    session.set('booted', '1')
    setBooting(false)
  }, [])

  const reboot = useCallback(() => {
    setBootKey((k) => k + 1)
    setBooting(true)
  }, [])

  return (
    <div className="scanlines h-dvh">
      {booting ? <BootScreen key={bootKey} onDone={done} /> : <TerminalApp key={bootKey} onReboot={reboot} />}
    </div>
  )
}
