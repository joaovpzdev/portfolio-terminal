import { createContext, useContext } from 'react'

// Ações do terminal disponíveis para qualquer saída renderizada (ex.: clicar num comando)
export const TerminalActions = createContext({ run: () => {} })

// Comando clicável: digita e executa no terminal
export function Cmd({ children, cmd }) {
  const { run } = useContext(TerminalActions)
  const text = cmd ?? children
  return (
    <button
      type="button"
      onClick={() => run(text)}
      className="justify-self-start text-left text-amber underline decoration-dotted underline-offset-4 hover:text-void hover:bg-amber focus-visible:outline focus-visible:outline-amber cursor-pointer"
    >
      {children}
    </button>
  )
}

export function Ext({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber underline underline-offset-4 hover:bg-amber hover:text-void"
    >
      {children}
    </a>
  )
}

export const Muted = ({ children }) => <span className="text-muted">{children}</span>
export const Err = ({ children }) => <span className="text-alert">{children}</span>

export function Tag({ team }) {
  return team === 'red' ? <span className="text-alert">[red] </span> : <span className="text-sky-400">[blue]</span>
}

export const Block = ({ children }) => <div className="space-y-1">{children}</div>
