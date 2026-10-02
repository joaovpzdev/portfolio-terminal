import projects from '../data/projects.json'
import { WHOAMI, IDENTITY, SKILLS, CERTS, CONTACT, RESUMES, GITHUB_USER } from '../data/profile.js'
import { searchProjects } from '../lib/search.js'
import { Cmd, Ext, Muted, Err, Tag, Block } from '../terminal/ui.jsx'
import pt from '../i18n/pt.json'
import en from '../i18n/en.json'

const DICTS = { pt, en }

const repoUrl = (p) => `https://github.com/${GITHUB_USER}/${p.repo}`
export const findProject = (name) => {
  const n = String(name ?? '').toLowerCase()
  return projects.find((p) => p.alias === n || p.repo === n) ?? null
}

function ProjectRow({ p, lang }) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr] gap-x-3 sm:grid-cols-[3.5rem_7rem_1fr]">
      <Tag team={p.team} />
      <span className="justify-self-start">
        <Cmd cmd={`open ${p.alias}`}>{p.alias}</Cmd>
      </span>
      <span className="col-span-2 text-muted sm:col-span-1">{p.summary[lang]}</span>
    </div>
  )
}

function download(file) {
  const a = document.createElement('a')
  a.href = file
  a.download = file.split('/').pop()
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ---------------------------------------------------------------------------

const help = {
  name: 'help',
  aliases: ['?'],
  group: 'navigate',
  run: ({ t, registry }) => (
    <Block>
      <div className="glow">{t('help.title')}</div>
      {registry.list().map((c) => (
        <div key={c.name} className="grid grid-cols-[9rem_1fr] gap-x-3">
          <Cmd>{c.name}</Cmd>
          <Muted>{t(`cmd.${c.name}`)}</Muted>
        </div>
      ))}
      <Muted>{t('help.footer')}</Muted>
    </Block>
  ),
}

const map = {
  name: 'map',
  group: 'navigate',
  run: ({ openMap }) => {
    openMap()
    return null
  },
}

const whoami = {
  name: 'whoami',
  aliases: ['about'],
  group: 'navigate',
  run: ({ lang, t }) => {
    const w = WHOAMI[lang]
    return (
      <Block>
        <div className="glow font-bold">
          {IDENTITY.name} <Muted>// aka {IDENTITY.handle}</Muted>
        </div>
        <Muted>
          {IDENTITY.city} · {w.role}
        </Muted>
        {w.paragraphs.map((p, i) => (
          <p key={i} className="max-w-3xl pt-2">
            {p}
          </p>
        ))}
        <p className="pt-2">{t('ls.tip', { cmd: <Cmd>ls projects</Cmd> })}</p>
      </Block>
    )
  },
}

const skills = {
  name: 'skills',
  group: 'navigate',
  run: ({ t }) => (
    <Block>
      <div>~/skills</div>
      {SKILLS.map((g, gi) => {
        const lastGroup = gi === SKILLS.length - 1
        return (
          <div key={g.key} className="whitespace-pre">
            <div>
              {lastGroup ? '└── ' : '├── '}
              <span className={g.key === 'red' ? 'text-alert' : g.key === 'blue' ? 'text-sky-400' : ''}>
                {t(`skills.${g.key}`)}/
              </span>
            </div>
            {g.items.map((it, i) => (
              <div key={it} className="text-muted">
                {lastGroup ? '    ' : '│   '}
                {i === g.items.length - 1 ? '└── ' : '├── '}
                <span className="text-phosphor">{it}</span>
              </div>
            ))}
          </div>
        )
      })}
    </Block>
  ),
}

const certs = {
  name: 'certs',
  group: 'navigate',
  run: ({ t }) => (
    <Block>
      {CERTS.map((c) => (
        <div key={c.name}>
          {c.status === 'done' ? <span>[✓] </span> : <span className="text-amber">[~] </span>}
          {c.name} <Muted>· {c.issuer} · {t(`certs.${c.status}`)}</Muted>
        </div>
      ))}
    </Block>
  ),
}

const ls = {
  name: 'ls',
  aliases: ['projects'],
  group: 'projects',
  run: ({ flags, lang, t, hint }) => {
    const team = flags.red ? 'red' : flags.blue ? 'blue' : null
    const list = team ? projects.filter((p) => p.team === team) : projects
    hint('hint.afterLs', { cmd: 'open <alias>' })
    return (
      <Block>
        <Muted>{t('ls.header', { n: list.length })}</Muted>
        {list.map((p) => (
          <ProjectRow key={p.repo} p={p} lang={lang} />
        ))}
      </Block>
    )
  },
}

const open = {
  name: 'open',
  aliases: ['cat'],
  group: 'projects',
  run: ({ args, flags, lang, t, hint }) => {
    if (!args[0]) return <Muted>{t('open.usage')}</Muted>
    const p = findProject(args[0])
    if (!p) {
      return (
        <Block>
          <Err>{t('open.notFound', { name: args[0] })}</Err>
          <div>{t('ls.tip', { cmd: <Cmd>ls projects</Cmd> })}</div>
        </Block>
      )
    }
    const url = repoUrl(p)
    if (flags.readme) {
      window.open(`${url}#readme`, '_blank', 'noopener,noreferrer')
      return (
        <Muted>
          {t('open.readmeOpened', { repo: p.repo })} <Ext href={`${url}#readme`}>{url}#readme</Ext>
        </Muted>
      )
    }
    hint('hint.afterOpen', { cmd: 'ls projects', resume: `resume --${p.team}` })
    return (
      <Block>
        <div className="glow font-bold">
          <Tag team={p.team} /> {p.title}
        </div>
        <p className="max-w-3xl">{p.summary[lang]}</p>
        <div className="pt-1">
          <Muted>{t('open.stack')}:</Muted> {p.stack.join(' · ')}
        </div>
        <div className="pt-1 text-muted">{t('open.highlights')}:</div>
        {p.highlights[lang].map((h) => (
          <div key={h} className="pl-2">
            <span className="text-muted">› </span>
            {h}
          </div>
        ))}
        <div className="pt-1">
          <Muted>{t('open.links')}:</Muted> <Ext href={url}>{t('open.repo')}</Ext> ·{' '}
          <Cmd cmd={`open ${p.alias} --readme`}>{t('open.readme')}</Cmd>
        </div>
      </Block>
    )
  },
}

const search = {
  name: 'search',
  aliases: ['grep', 'find'],
  group: 'projects',
  run: ({ args, lang, t }) => {
    const q = args.join(' ')
    if (!q) return <Muted>{t('search.usage')}</Muted>
    const found = searchProjects(projects, q, lang)
    if (!found.length) return <Muted>{t('search.none', { q })}</Muted>
    return (
      <Block>
        <Muted>{t('search.results', { n: found.length, q })}</Muted>
        {found.map((p) => (
          <ProjectRow key={p.repo} p={p} lang={lang} />
        ))}
      </Block>
    )
  },
}

const resume = {
  name: 'resume',
  aliases: ['cv'],
  group: 'resumes',
  run: ({ args, flags, t }) => {
    const type = flags.red || args[0] === 'red' ? 'red' : flags.blue || args[0] === 'blue' ? 'blue' : null
    if (!type) {
      return (
        <Block>
          <Muted>{t('resume.usage')}</Muted>
          <div>
            <Cmd>resume --red</Cmd> · <Cmd>resume --blue</Cmd>
          </div>
        </Block>
      )
    }
    const r = RESUMES[type]
    download(r.file)
    return (
      <div>
        <span className={type === 'red' ? 'text-alert' : 'text-sky-400'}>{t('resume.downloading', { label: r.label })}</span>{' '}
        <a href={r.file} download className="text-amber underline underline-offset-4">
          {t('resume.manual')}
        </a>
      </div>
    )
  },
}

const contact = {
  name: 'contact',
  group: 'contact',
  run: ({ t }) => (
    <Block>
      <Muted>{t('contact.title')}</Muted>
      {CONTACT.map((c) => (
        <div key={c.label} className="grid grid-cols-[6rem_1fr] gap-x-3">
          <span>{c.label}</span>
          <Ext href={c.href}>{c.value}</Ext>
        </div>
      ))}
    </Block>
  ),
}

const lang = {
  name: 'lang',
  group: 'system',
  run: ({ args, setLang, t }) => {
    const next = (args[0] ?? '').toLowerCase()
    // A confirmação sai no idioma novo
    return setLang(next) ? <span>{DICTS[next]['lang.changed']}</span> : <Muted>{t('lang.usage')}</Muted>
  },
}

const reboot = {
  name: 'reboot',
  group: 'system',
  run: ({ reboot: doReboot }) => {
    doReboot()
    return null
  },
}

const clear = {
  name: 'clear',
  aliases: ['cls'],
  group: 'system',
  run: ({ clear: doClear }) => {
    doClear()
    return null
  },
}

const history = {
  name: 'history',
  group: 'system',
  run: ({ history: h, t }) =>
    h.length ? (
      <Block>
        {h.map((line, i) => (
          <div key={i}>
            <Muted>{String(i + 1).padStart(3, ' ')} </Muted>
            {line}
          </div>
        ))}
      </Block>
    ) : (
      <Muted>{t('history.empty')}</Muted>
    ),
}

export const COMMANDS = [help, map, whoami, skills, certs, ls, open, search, resume, contact, lang, reboot, clear, history]

// Linhas do popup "Mapa de comandos": comando -> destino
export const COMMAND_MAP = [
  { group: 'navigate', cmd: 'help', dest: 'dest.help' },
  { group: 'navigate', cmd: 'map', dest: 'dest.map' },
  { group: 'navigate', cmd: 'whoami', dest: 'dest.whoami' },
  { group: 'navigate', cmd: 'skills', dest: 'dest.skills' },
  { group: 'navigate', cmd: 'certs', dest: 'dest.certs' },
  { group: 'projects', cmd: 'ls projects', dest: 'dest.ls' },
  { group: 'projects', cmd: 'ls projects --blue', alt: '--red', dest: 'dest.lsFilter' },
  { group: 'projects', cmd: 'open zabbix', pattern: 'open <alias>', dest: 'dest.open' },
  { group: 'projects', cmd: 'open recon --readme', pattern: 'open <alias> --readme', dest: 'dest.openReadme' },
  { group: 'projects', cmd: 'search zabbix', pattern: 'search <termo>', dest: 'dest.search' },
  { group: 'resumes', cmd: 'resume --red', dest: 'dest.resumeRed' },
  { group: 'resumes', cmd: 'resume --blue', dest: 'dest.resumeBlue' },
  { group: 'contact', cmd: 'contact', dest: 'dest.contact' },
  { group: 'system', cmd: 'lang en', pattern: 'lang pt | lang en', dest: 'dest.lang' },
  { group: 'system', cmd: 'reboot', dest: 'dest.reboot' },
  { group: 'system', cmd: 'clear', dest: 'dest.clear' },
]

export { projects }
