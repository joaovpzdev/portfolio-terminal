// Conteúdo editorial: whoami, skills, certs, contato e currículos.

export const IDENTITY = {
  name: 'João Victor Paixão Zolim',
  handle: 'CHAKAL',
  city: 'São Paulo, BR',
}

export const WHOAMI = {
  pt: {
    role: 'Dev full stack → Segurança da Informação',
    paragraphs: [
      'Fui bombeiro militar: aprendi que incidente não marca hora e que procedimento bem treinado vale ouro quando tudo pega fogo.',
      'Depois, na oficina como mecânico e soldador: diagnosticar a falha, desmontar, entender, consertar. Hoje faço o mesmo com sistemas.',
      'Desenvolvo com JavaScript, Node.js, Python, Flask, Bash e Docker, e levo isso para a segurança: monitoramento e resposta no Blue Team, reconhecimento e análise de vulnerabilidades no Red Team.',
      'Fora do terminal: escalador amador e corredor. Na parede ou na pista, o método é o mesmo: ler a rota, ajustar, seguir.',
    ],
  },
  en: {
    role: 'Full stack dev → Information Security',
    paragraphs: [
      "Former military firefighter: incidents don't book appointments, and well-drilled procedures pay off when everything is on fire.",
      'Then the workshop, as a mechanic and welder: diagnose the failure, tear it down, understand it, fix it. Now I do the same with systems.',
      'I build with JavaScript, Node.js, Python, Flask, Bash and Docker, and point it at security: monitoring and response on the Blue Team, recon and vulnerability analysis on the Red Team.',
      'Off the terminal: amateur climber and runner. On the wall or on the track, same method: read the route, adjust, move.',
    ],
  },
}

// Árvore de habilidades (nomes técnicos não são traduzidos)
export const SKILLS = [
  {
    key: 'blue',
    items: ['Zabbix 7.0', 'Windows Event Log (4625, 7045)', 'SIEM / SOAR', 'Triagem de alertas', 'Hardening Linux', 'AbuseIPDB'],
  },
  {
    key: 'red',
    items: ['Kali Linux', 'Nmap', 'Nuclei', 'Burp Suite', 'SQLMap', 'Hashcat / John', 'OSINT: SpiderFoot, recon-ng, httpx'],
  },
  {
    key: 'dev',
    items: ['JavaScript', 'Node.js', 'Express', 'React', 'Python', 'Flask', 'Bash', 'Prisma', 'PostgreSQL'],
  },
  {
    key: 'infra',
    items: ['Docker', 'Docker Compose', 'Linux', 'Windows', 'Git', 'GitHub'],
  },
]

// status: done | progress
export const CERTS = [
  { name: 'Ethical Hacker', issuer: 'Cisco', status: 'done' },
  { name: 'Oracle Cloud Infrastructure Foundations Associate', issuer: 'Oracle', status: 'done' },
  { name: 'Introduction to Cybersecurity', issuer: 'Cisco', status: 'done' },
  { name: 'Conceitos Básicos de Redes', issuer: 'Cisco', status: 'progress' },
  { name: 'Defesa de Rede', issuer: 'Cisco', status: 'progress' },
]

export const CONTACT = [
  { label: 'email', value: 'joaovpz.dev@gmail.com', href: 'mailto:joaovpz.dev@gmail.com' },
  {
    label: 'linkedin',
    value: 'linkedin.com/in/joao-victor-paixao-zolim-b54595419',
    href: 'https://www.linkedin.com/in/joao-victor-paixao-zolim-b54595419',
  },
  { label: 'github', value: 'github.com/joaovpzdev', href: 'https://github.com/joaovpzdev' },
]

// Fase 1: PDFs servidos como arquivos estáticos. Na Fase 2 passam para /api/resume/:type
export const RESUMES = {
  red: { file: '/resumes/Curriculo_Joao_Victor_Zolim_Red_Team.pdf', label: 'Red Team' },
  blue: { file: '/resumes/Curriculo_Joao_Victor_Zolim_Blue_Team.pdf', label: 'Blue Team' },
}

export const GITHUB_USER = 'joaovpzdev'
