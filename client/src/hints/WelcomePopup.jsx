import { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'

const ESSENTIALS = ['help', 'ls projects', 'open zabbix', 'resume --red', 'contact']

export default function WelcomePopup({ onRun, onClose }) {
  const { t } = useI18n()
  const [hideNext, setHideNext] = useState(false)
  const close = () => onClose(hideNext)

  return (
    <div
      role="dialog"
      aria-labelledby="welcome-title"
      className="fixed right-4 bottom-24 left-4 z-40 border border-phosphor-dim bg-panel p-4 text-sm shadow-[0_0_24px_rgba(51,255,102,0.15)] sm:left-auto sm:w-96"
    >
      <h2 id="welcome-title" className="glow mb-1 font-bold">
        {t('hint.welcomeTitle')}
      </h2>
      <p className="mb-3 text-muted">{t('hint.welcomeBody')}</p>
      <ul className="mb-3 space-y-1">
        {ESSENTIALS.map((c) => (
          <li key={c}>
            <button
              type="button"
              onClick={() => {
                onRun(c)
                close()
              }}
              className="w-full px-2 py-1 text-left text-amber hover:bg-amber hover:text-void"
            >
              › {c}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={hideNext} onChange={(e) => setHideNext(e.target.checked)} />
          {t('hint.dontShow')}
        </label>
        <button type="button" onClick={close} className="border border-line px-2 py-0.5 text-xs hover:border-phosphor">
          {t('hint.close')}
        </button>
      </div>
    </div>
  )
}
