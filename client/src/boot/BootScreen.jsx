import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { RESUMES } from '../data/profile.js'
import projects from '../data/projects.json'

const CHAKAL = String.raw` ██████╗██╗  ██╗ █████╗ ██╗  ██╗ █████╗ ██╗
██╔════╝██║  ██║██╔══██╗██║ ██╔╝██╔══██╗██║
██║     ███████║███████║█████╔╝ ███████║██║
██║     ██╔══██║██╔══██║██╔═██╗ ██╔══██║██║
╚██████╗██║  ██║██║  ██║██║  ██╗██║  ██║███████╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝`

const OBSERVATIONS = String.raw`   ___  ___ ___ ___ _____   ___ _____ ___ ___  _  _ ___
  / _ \| _ ) __| __| _ \ \ / /_\_   _|_ _/ _ \| \| / __|
 | (_) | _ \__ \ _||   /\ V / _ \| |  | | (_) | .${'`'} \__ \
  \___/|___/___/___|_|_\ \_/_/ \_\_| |___\___/|_|\_|___/`

const MIN_MS = 2500
const MAX_MS = 8000
const TYPE_MS = 55

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Cada etapa só fecha quando o trabalho real termina (Fase 2: chamadas à API)
function useLoadSteps() {
  const [done, setDone] = useState([false, false, false, false])
  useEffect(() => {
    let alive = true
    const mark = (i) => alive && setDone((d) => d.map((v, j) => (j === i ? true : v)))

    const fonts = document.fonts?.ready ?? Promise.resolve()
    fonts.then(() => mark(0))
    Promise.resolve(projects.length).then(() => setTimeout(() => mark(1), 400))
    Promise.allSettled(Object.values(RESUMES).map((r) => fetch(r.file, { method: 'HEAD' }))).then(() =>
      setTimeout(() => mark(2), 700),
    )
    return () => {
      alive = false
    }
  }, [])
  // "terminal pronto" fecha quando as outras três fecharem
  const all = done.slice(0, 3).every(Boolean)
  return [done[0], done[1], done[2], all]
}

export default function BootScreen({ onDone }) {
  const { t } = useI18n()
  const slogan = t('boot.slogan')
  const [typed, setTyped] = useState(() => (reducedMotion() ? slogan.length : 0))
  const [elapsed, setElapsed] = useState(false)
  const [showLogo, setShowLogo] = useState(reducedMotion())
  const steps = useLoadSteps()
  const finished = useRef(false)

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onDone()
  }

  // Cursor sozinho por 400 ms, depois o logo entra com glitch
  useEffect(() => {
    const a = setTimeout(() => setShowLogo(true), 400)
    const b = setTimeout(() => setElapsed(true), MIN_MS)
    const c = setTimeout(finish, MAX_MS)
    return () => [a, b, c].forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Slogan digitado caractere a caractere
  useEffect(() => {
    if (!showLogo || typed >= slogan.length) return
    const id = setTimeout(() => setTyped((n) => n + 1), TYPE_MS)
    return () => clearTimeout(id)
  }, [showLogo, typed, slogan.length])

  const sloganDone = typed >= slogan.length
  const allDone = steps.every(Boolean)

  useEffect(() => {
    if (elapsed && sloganDone && allDone) {
      const id = setTimeout(finish, 600)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, sloganDone, allDone])

  // Qualquer tecla ou clique pula
  useEffect(() => {
    const skip = () => finish()
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const labels = [
    t('boot.step.modules'),
    t('boot.step.targets', { n: projects.length }),
    t('boot.step.resumes'),
    t('boot.step.ready'),
  ]
  const progress = Math.round(
    ((steps.filter(Boolean).length / steps.length) * 0.6 + (typed / slogan.length) * 0.4) * 100,
  )

  return (
    <div
      className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-10"
      role="status"
      aria-label="CHAKAL OBSERVATIONS"
    >
      {!showLogo ? (
        <span className="cursor-block" aria-hidden />
      ) : (
        <>
          <div className="glitch flex flex-col items-center" aria-hidden>
            <pre className="ascii glow text-phosphor">{CHAKAL}</pre>
            <pre className="ascii mt-2 text-phosphor-dim">{OBSERVATIONS}</pre>
          </div>

          <div className="w-full max-w-2xl min-h-[5.5rem] text-center text-sm sm:text-base">
            <p className="text-phosphor">
              “{slogan.slice(0, typed)}
              {sloganDone ? '”' : <span className="cursor-block" aria-hidden />}
            </p>
            {sloganDone && <p className="mt-2 text-muted">{t('boot.author')}</p>}
          </div>

          <div className="w-full max-w-md text-xs sm:text-sm">
            {labels.map((label, i) => (
              <div key={i} className="flex gap-2">
                <span className={steps[i] ? 'text-phosphor' : 'text-muted'}>{steps[i] ? '[ OK ]' : '[ .. ]'}</span>
                <span className={steps[i] ? '' : 'text-muted'}>{label}</span>
              </div>
            ))}
            <div className="mt-3 h-1.5 w-full bg-line" aria-hidden>
              <div className="h-full bg-phosphor transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-center text-muted">{t('boot.skip')}</p>
          </div>
        </>
      )}
    </div>
  )
}
