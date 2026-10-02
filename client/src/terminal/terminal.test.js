import { describe, it, expect } from 'vitest'
import { parse, tokenize } from './parser.js'
import { levenshtein, closest } from './suggest.js'
import { complete } from './autocomplete.js'
import { createRegistry } from './registry.js'
import { searchProjects } from '../lib/search.js'
import projects from '../data/projects.json'

describe('parser', () => {
  it('separa comando, argumentos e flags', () => {
    expect(parse('open recon --readme')).toMatchObject({
      name: 'open',
      args: ['recon'],
      flags: { readme: true },
    })
  })

  it('normaliza o nome para minúsculas e ignora espaços extras', () => {
    expect(parse('   LS   projects  ').name).toBe('ls')
    expect(parse('   LS   projects  ').args).toEqual(['projects'])
  })

  it('aceita flags com valor e flags curtas agrupadas', () => {
    expect(parse('x --lang=en -ab').flags).toEqual({ lang: 'en', a: true, b: true })
  })

  it('respeita aspas', () => {
    expect(tokenize('search "zabbix docker"')).toEqual(['search', 'zabbix docker'])
  })

  it('linha vazia vira nome vazio', () => {
    expect(parse('').name).toBe('')
  })

  it('corta entradas gigantes', () => {
    expect(parse('a'.repeat(5000)).raw.length).toBe(200)
  })
})

describe('suggest', () => {
  it('calcula a distância de edição', () => {
    expect(levenshtein('projcts', 'projects')).toBe(1)
    expect(levenshtein('', 'abc')).toBe(3)
  })

  it('sugere o comando mais próximo até distância 2', () => {
    expect(closest('hlep', ['help', 'whoami'])).toBe('help')
    expect(closest('xyzxyz', ['help', 'whoami'])).toBeNull()
  })
})

describe('autocomplete', () => {
  const ctx = { commandNames: ['help', 'whoami', 'open', 'ls'], projectAliases: ['recon', 'zabbix', 'soar'] }

  it('completa nome de comando único', () => {
    expect(complete('who', ctx).value).toBe('whoami ')
  })

  it('completa alias de projeto depois de open', () => {
    expect(complete('open zab', ctx).value).toBe('open zabbix ')
  })

  it('completa as flags de currículo também no alias cv', () => {
    expect(complete('cv --r', ctx).value).toBe('cv --red ')
    expect(complete('projects --b', ctx).value).toBe('projects --blue ')
  })

  it('lista opções quando há mais de uma', () => {
    expect(complete('open ', ctx).options).toEqual(['recon', 'zabbix', 'soar'])
  })
})

describe('registry', () => {
  it('resolve aliases e recusa duplicados', () => {
    const reg = createRegistry([{ name: 'whoami', aliases: ['about'] }])
    expect(reg.get('about').name).toBe('whoami')
    expect(() => createRegistry([{ name: 'a' }, { name: 'b', aliases: ['a'] }])).toThrow()
  })
})

describe('dados e busca', () => {
  it('tem exatamente os 8 projetos liberados, com aliases únicos', () => {
    expect(projects).toHaveLength(8)
    expect(new Set(projects.map((p) => p.alias)).size).toBe(8)
    expect(projects.filter((p) => p.team === 'red').map((p) => p.repo).sort()).toEqual([
      'cyber-sec-journey',
      'pentest-findings-dash',
      'visual-recon',
    ])
  })

  it('encontra por stack e ignora acentos', () => {
    expect(searchProjects(projects, 'flask').map((p) => p.alias)).toContain('soar')
    expect(searchProjects(projects, 'remediacao').map((p) => p.alias)).toContain('findings')
  })

  it('prioriza correspondência exata do alias', () => {
    expect(searchProjects(projects, 'zabbix')[0].alias).toBe('zabbix')
  })
})
