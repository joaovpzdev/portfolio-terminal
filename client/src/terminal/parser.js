// Quebra uma linha de comando em nome + argumentos + flags.
// Ex.: `open recon --readme` -> { name: 'open', args: ['recon'], flags: { readme: true } }
// Aceita aspas para argumentos com espaço: search "zabbix docker"

export function tokenize(line) {
  const tokens = []
  let current = ''
  let quote = null

  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null
      else current += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
    } else if (/\s/.test(ch)) {
      if (current) tokens.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current) tokens.push(current)
  return tokens
}

export function parse(line) {
  const raw = String(line ?? '').slice(0, 200) // linha longa não trava a UI
  const tokens = tokenize(raw.trim())
  const [first = '', ...rest] = tokens
  const args = []
  const flags = {}

  for (const tok of rest) {
    if (tok.startsWith('--') && tok.length > 2) {
      const [key, value] = tok.slice(2).split('=')
      flags[key.toLowerCase()] = value ?? true
    } else if (tok.startsWith('-') && tok.length > 1 && !/^-\d/.test(tok)) {
      for (const k of tok.slice(1)) flags[k.toLowerCase()] = true
    } else {
      args.push(tok)
    }
  }

  return { name: first.toLowerCase(), args, flags, raw }
}
