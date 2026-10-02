import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { COMMAND_MAP, projects } from '../commands/index.jsx'

const GROUPS = ['navigate', 'projects', 'resumes', 'contact', 'system']

// Popup "Mapa de comandos": comando -> destino. Cada linha executa o comando.
export default function CommandMap({ open, onClose, onRun }) {
  const { t } = useI18n()
  const [filter, setFilter] = useState('')
  const ref = useRef(null)
  const filterRef = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      setFilter('')
      filterRef.current?.focus()
    } else if (!open && d.open) d.close()
  }, [open])

  const run = (cmd) => {
    onClose()
    onRun(cmd)
  }

  const q = filter.trim().toLowerCase()
  const rows = COMMAND_MAP.filter(
    (r) => !q || r.cmd.includes(q) || (r.pattern ?? '').includes(q) || String(t(r.dest)).toLowerCase().includes(q),
  )

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-hidden border border-phosphor-dim bg-panel p-0 text-phosphor backdrop:bg-black/70"
      aria-labelledby="map-title"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <h2 id="map-title" className="glow font-bold">
            {t('map.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-phosphor focus-visible:text-phosphor focus-visible:outline-none"
          >
            {t('map.close')}
          </button>
        </div>

        <div className="border-b border-line px-4 py-2">
          <input
            ref={filterRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t('map.filter')}
            aria-label={t('map.filter')}
            className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted"
          />
        </div>

        <div className="term-scroll min-h-0 flex-1 overflow-y-auto px-4 py-2 text-sm">
          {GROUPS.map((g) => {
            const groupRows = rows.filter((r) => r.group === g)
            if (!groupRows.length) return null
            return (
              <section key={g} className="mb-3">
                <h3 className="mb-1 text-xs uppercase tracking-widest text-muted">{t(`group.${g}`)}</h3>
                <ul>
                  {groupRows.map((r) => (
                    <li key={r.cmd}>
                      <button
                        type="button"
                        onClick={() => run(r.cmd)}
                        className="grid w-full grid-cols-1 gap-x-4 px-2 py-1.5 text-left hover:bg-phosphor/10 focus-visible:bg-phosphor/10 focus-visible:outline-none sm:grid-cols-[13rem_1fr_13rem]"
                      >
                        <code className="text-amber">
                          {r.pattern ?? r.cmd}
                          {r.alt && <span className="text-muted"> / {r.alt}</span>}
                        </code>
                        <span>{t(r.dest)}</span>
                        <code className="hidden whitespace-nowrap text-muted sm:block">› {r.cmd}</code>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <div className="border-t border-line px-4 py-3">
          <div className="mb-2 text-xs uppercase tracking-widest text-muted">{t('map.aliases')}</div>
          <div className="flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.alias}
                type="button"
                onClick={() => run(`open ${p.alias}`)}
                className={`border px-2 py-0.5 text-xs hover:bg-phosphor hover:text-void ${
                  p.team === 'red' ? 'border-alert/60' : 'border-sky-400/60'
                }`}
              >
                {p.alias}
              </button>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}
