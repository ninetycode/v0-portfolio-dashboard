# Skills de Cursor

Configuración para que el agente diseñe y anime este portfolio (Next.js, mathiasandino.ar) sin tocar la identidad de Mathias Andino. La regla siempre activa está en `.cursor/rules/marca-personal.mdc`.

No se cambió código ni diseño del sitio. `package.json` sigue sin `motion`, `framer-motion` y `gsap`: solo hay `tw-animate-css` y transiciones CSS. Las skills de animación enseñan cómo agregarlas bien cuando se modernice el sitio.

## Qué se instaló

Copias literales del contenido vigente de cada repo (commits al clonar). No se reescribió ninguna skill.

| Carpeta | Fuente | Commit |
| --- | --- | --- |
| `skills/frontend-design/` (`SKILL.md` + `LICENSE.txt`, que la skill cita) | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | `ca45fc4` (2026-10-28) |
| `skills/web-design-guidelines/` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | `1a2c79d` (2026-10-27) |
| `skills/react-best-practices/` (`SKILL.md`, `AGENTS.md`, `rules/` y el resto de la carpeta) | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | `1a2c79d` (2026-10-27) |
| `skills/motion/` y los archivos que enlaza (`best-practices/`, `codex/`, `css-spring/`, `insert/`, `performance-audit/`, `transition-preview/`) | [motiondivision/ai-kit](https://github.com/motiondivision/ai-kit/tree/main/plugins/motion/skills/motion), kit oficial de Motion | `1e42494` (2026-10-26) |
| `skills/gsap-core/`, `gsap-timeline/`, `gsap-scrolltrigger/`, `gsap-plugins/`, `gsap-utils/`, `gsap-react/`, `gsap-performance/`, `gsap-frameworks/` | [greensock/gsap-skills](https://github.com/greensock/gsap-skills), skills oficiales de GSAP | `aed9cfd` (2026-04-21) |

`web-design-guidelines` no trae reglas locales: antes de cada revisión pide bajar las guías vigentes desde `vercel-labs/web-interface-guidelines`.

No hizo falta escribir una skill propia de animación. Existen las oficiales de Motion (motion.dev, antes Framer Motion) y de GSAP, y se copiaron esas.

## Prompts de ejemplo

- Usando la skill frontend-design, rediseñá el hero para que se lean de inmediato el nombre Mathias Andino y el rol «Game Designer junior con foco en narrativa», con el monograma MA y el verde menta del tema oscuro.
- Usando la skill web-design-guidelines, revisá la home y `/proyectos`: accesibilidad, foco de teclado e interacción. Listá los hallazgos en el formato de la skill.
- Usando la skill react-best-practices, revisá el rendimiento de `components/hero-section.tsx` y `components/games-gallery.tsx` y aplicá solo las reglas que correspondan.
- Usando las skills motion y gsap-scrolltrigger, proponé la entrada del hero y un reveal al hacer scroll. No instales `motion` ni `gsap` sin decirlo: todavía no están en package.json. Respetá `prefers-reduced-motion`.
