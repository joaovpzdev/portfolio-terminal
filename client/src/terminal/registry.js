// Registro de comandos: nome -> módulo, com aliases.
// Cada comando: { name, aliases?, group, usage, descKey, hidden?, run(ctx) }

export function createRegistry(commands) {
  const byName = new Map()

  for (const cmd of commands) {
    for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
      if (byName.has(key)) throw new Error(`Comando duplicado: ${key}`)
      byName.set(key, cmd)
    }
  }

  return {
    get: (name) => byName.get(name) ?? null,
    list: () => commands.filter((c) => !c.hidden),
    names: () => [...byName.keys()],
  }
}
