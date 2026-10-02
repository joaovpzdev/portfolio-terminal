// Completa o input com Tab.
// - 1ª palavra: nomes de comando
// - depois de open/cat: aliases de projeto
// - depois de ls: "projects"; depois de ls projects/projects/resume/cv: --red / --blue

const SECOND_WORD = {
  ls: ['projects'],
  projects: ['--red', '--blue'],
  resume: ['--red', '--blue'],
  cv: ['--red', '--blue'],
  lang: ['pt', 'en'],
}

export function complete(input, { commandNames, projectAliases }) {
  const endsWithSpace = /\s$/.test(input)
  const parts = input.trimStart().split(/\s+/)
  const partial = endsWithSpace ? '' : parts.pop() ?? ''
  const head = parts

  let pool
  if (head.length === 0) {
    pool = commandNames
  } else {
    const cmd = head[0].toLowerCase()
    if (cmd === 'open' || cmd === 'cat') pool = projectAliases
    else if (cmd === 'ls' && head.length >= 2) pool = ['--red', '--blue']
    else pool = SECOND_WORD[cmd] ?? []
  }

  const options = pool.filter((o) => o.startsWith(partial.toLowerCase()))
  if (options.length === 0) return { value: input, options: [] }

  const prefix = head.length ? head.join(' ') + ' ' : ''
  if (options.length === 1) return { value: prefix + options[0] + ' ', options }

  // Vários: completa até o maior prefixo comum
  let common = options[0]
  for (const o of options) {
    while (!o.startsWith(common)) common = common.slice(0, -1)
  }
  return { value: prefix + (common.length > partial.length ? common : partial), options }
}
