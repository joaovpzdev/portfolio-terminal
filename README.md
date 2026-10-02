# CHAKAL OBSERVATIONS · portfolio-terminal

Portfólio de **João Victor Paixão Zolim** (Red Team e Blue Team), navegado inteiramente por um terminal na tela. Visual inspirado em interfaces de terminal: fundo escuro, verde fósforo, scanlines.

> Fase 1 (atual): front-end estático, publicável na Vercel. Fase 2: API Node + Express + Prisma + PostgreSQL.

## Rodando localmente (WSL)

```bash
cd client
npm install
npm run dev        # http://localhost:5173
npm test           # testes do núcleo do terminal (Vitest)
npm run build && npm run preview   # build de produção com os mesmos headers de segurança da Vercel
```

Se o projeto estiver numa pasta do Windows (`/mnt/c/...`) e o recarregamento automático não funcionar, use `VITE_POLLING=1 npm run dev`.

## Comandos

| Comando | Destino |
| --- | --- |
| `help` | lista de comandos |
| `map` ou F1 | popup com o mapa de comandos |
| `whoami` | sobre mim |
| `skills` / `certs` | habilidades / certificações |
| `ls projects [--red\|--blue]` | os 8 projetos |
| `open <alias> [--readme]` | ficha do projeto |
| `search <termo>` | busca (qualquer palavra desconhecida também vira busca) |
| `resume --red` / `resume --blue` | baixa o currículo |
| `contact` | e-mail, LinkedIn, GitHub |
| `lang pt` / `lang en` | idioma |
| `reboot` / `clear` / `history` | sistema |

Atalhos: Tab completa, ↑ ↓ histórico, Ctrl+L limpa, Ctrl+C cancela.

## Estrutura

```
client/
  public/resumes/        PDFs dos currículos
  src/
    boot/                tela de loading CHAKAL OBSERVATIONS
    terminal/            parser, registro, autocomplete, sugestões, UI do terminal (+ testes)
    commands/            todos os comandos e o mapa de comandos
    hints/               popup de boas-vindas e mapa de comandos
    data/                projects.json (whitelist dos 8 repos) e profile.js
    i18n/                pt.json, en.json
    lib/                 busca nos projetos e acesso seguro ao localStorage
```

Adicionar um comando = um objeto em `src/commands/index.jsx` (e a linha dele em `COMMAND_MAP`).

## Segurança

- CSP sem `unsafe-inline`, fontes hospedadas no próprio domínio (sem Google Fonts), nada inlined como `data:`.
- HSTS, `nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy`.
- `/.well-known/security.txt` publicado.
- Nenhum HTML externo é injetado: toda saída do terminal é texto renderizado pelo React.
