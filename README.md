# v0-portfolio-dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_lCahECmpIMmXXjeLlNMvKZb3k7AD)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Agent skills for UX, accessibility, and front-end quality

Generic Cursor agent skills in `.cursor/skills/`. Each folder is a faithful copy of a public skill (instructions plus its license or connector note). They do not describe this site. Motion and GSAP skills already in the repo are unchanged.

`react-best-practices` is the upstream folder name. Cursor discovers it as `vercel-react-best-practices`, which is the `name` in its frontmatter. The Anthropic design skills include `LICENSE` (Apache-2.0) and `CONNECTORS.md` from the design plugin. `frontend-design` includes its `LICENSE.txt`. The Vercel skills state MIT in the upstream repo and do not ship a separate license file.

| Skill | Source | Example prompt |
| --- | --- | --- |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/web-design-guidelines) | Revisa la interfaz de este proyecto con las Web Interface Guidelines: accesibilidad, foco de teclado, formularios, tipografía e interacción. |
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62/skills/react-best-practices) | Revisa el rendimiento de React y Next.js de este proyecto y señala qué reglas de Vercel no se cumplen, por prioridad. |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/frontend-design) | Revisa el diseño visual de las páginas (tipografía, jerarquía, layout y responsive) y marca lo que se siente genérico o de plantilla. |
| `accessibility-review` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/2574e29377c7173d0cecffef29a6ecbd7f8ccb5d/design/skills/accessibility-review) | Haz una auditoría de accesibilidad WCAG 2.1 AA de las páginas principales: contraste, teclado, nombres accesibles y tamaño de los objetivos táctiles. |
| `design-critique` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/2574e29377c7173d0cecffef29a6ecbd7f8ccb5d/design/skills/design-critique) | Haz una crítica de UX/UI de la página de inicio: primera impresión, usabilidad, jerarquía visual y consistencia. |
| `design-system` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/2574e29377c7173d0cecffef29a6ecbd7f8ccb5d/design/skills/design-system) | Audita la consistencia visual (tipografía, espaciado, color, estados y accesibilidad) en los componentes de la interfaz. |
| `ux-copy` | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/2574e29377c7173d0cecffef29a6ecbd7f8ccb5d/design/skills/ux-copy) | Revisa la microcopia de la interfaz (botones, errores, estados vacíos y llamadas a la acción) y propone textos más claros. |
