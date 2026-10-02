// Busca simples nos 8 projetos (nome, alias, descrição, stack).
// Na Fase 2 a busca passa para a API, com README incluído.

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function searchProjects(projects, term, lang = 'pt') {
  const q = norm(term).trim()
  if (!q) return []

  return projects
    .map((p) => {
      let score = 0
      if (norm(p.alias) === q || norm(p.repo) === q) score += 10
      if (norm(p.repo).includes(q) || norm(p.alias).includes(q)) score += 5
      if (norm(p.title).includes(q)) score += 4
      if (p.stack.some((s) => norm(s).includes(q))) score += 3
      if (norm(p.summary[lang]).includes(q)) score += 2
      if (p.highlights[lang].some((h) => norm(h).includes(q))) score += 1
      return { project: p, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.project)
}
