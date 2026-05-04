# renan.agent

Portfólio pessoal de **Renan Miqueloti** — AI Engineer focado em agentes, RAG e observabilidade de LLM.

Live: <https://renanmiqueloti.vercel.app>

---

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Framework | Next.js 12 (SSG) | i18n nativo `pt-BR` / `en` sem rewrites manuais; saída 100% estática para edge cache no Vercel |
| UI | React 18 + TypeScript | Tipagem nas mensagens i18n para impedir chave faltando entre locales |
| Estilo | Tailwind CSS 3 | Componentes consistentes sem CSS-in-JS — bundle final < 30 kB de CSS |
| SEO | next-seo + JSON-LD `Person` / `WebSite` | Metas estruturadas + OG + Twitter Card por locale |
| Hosting | Vercel | SSG + edge + preview por PR |

---

## Arquitetura

Single-page com 4 sections (`About`, `Skills`, `Projects`, `Contact`). Conteúdo
e cópia ficam em `lib/i18n.ts` num único objeto tipado por locale — toda mudança
de texto passa pelo type-checker. Componentes em `components/Sections/*` consomem
o objeto via hook `useT()`.

```
pages/
  _app.tsx          # Layout root + provider de locale
  _document.tsx     # HTML lang dinâmico
  index.tsx         # Home — orquestra seções + NextSeo

components/
  Sections/         # 4 sections
  Navigation/       # header + locale toggle
  Misc/             # Window, Reveal (animações)

lib/
  i18n.ts           # mensagens PT/EN tipadas
  seo.ts            # constantes SEO + JSON-LD
  useLocale.tsx     # hook de tradução
  useActiveSection.ts
```

---

## Por que bilíngue?

A audiência alvo (recrutadores PJ no Brasil + oportunidades remotas internacionais)
é dual. Ter o site sair com `lang` correto e meta `og:locale` por idioma melhora
discoverability em LinkedIn (que respeita o locale do navegador do recrutador).

A escolha de fazer i18n via objeto único em `lib/i18n.ts` (em vez de `next-intl` ou
`react-i18next`) é proposital — ~50 chaves não justificam o overhead de uma lib;
ganha-se type-safety nativa e zero runtime.

---

## Performance

Alvo: Lighthouse >= 95 em todas as categorias no mobile.

- SSG sem JS no caminho crítico além do necessário para hidratação
- Fontes via `next/font` (sem FOUT)
- Imagens otimizadas em `public/assets/` (WebP onde faz sentido)
- Animações `Reveal` puramente CSS via `IntersectionObserver` — sem framer-motion

---

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Scripts

| Script | Descrição |
|---|---|
| `dev` | Dev server com HMR |
| `build` | Build estático para produção |
| `start` | Serve o build localmente |
| `lint` | ESLint |
| `typecheck` | `tsc --noEmit` |

---

## Deploy

Push para `main1` -> Vercel build automático -> live em `renanmiqueloti.vercel.app`.

Branch previews ativos para PRs.
