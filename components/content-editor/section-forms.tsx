"use client"

import { Button } from "@/components/ui/button"
import type {
  AboutContent,
  ExperienceContent,
  HomeContent,
  Lang,
  LucideTool,
  MissionsContent,
  ToolsContent,
} from "@/lib/site-content/types"
import {
  AddButton,
  BiField,
  CheckField,
  emptyText,
  Group,
  ItemCard,
  moveItem,
  newId,
  NumberField,
  SelectField,
  TextField,
} from "./editor-fields"

type FormProps<T> = {
  value: T
  lang: Lang
  onChange: (value: T) => void
}

const iconOptions = [
  { value: "gamepad", label: "Control" },
  { value: "code", label: "Código" },
  { value: "target", label: "Diana" },
  { value: "trophy", label: "Trofeo" },
]

const experienceTypes = [
  { value: "work", label: "Trabajo" },
  { value: "project", label: "Proyecto" },
  { value: "milestone", label: "Hito" },
]

const questKinds = [
  { value: "feedback", label: "Feedback de juego" },
  { value: "hire", label: "Contratación freelance" },
  { value: "playtest", label: "Prueba de videojuego" },
  { value: "interview", label: "Entrevista laboral" },
]

const difficulties = [
  { value: "easy", label: "Fácil" },
  { value: "normal", label: "Normal" },
  { value: "legendary", label: "Legendario" },
]

const socialIcons = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "itch", label: "Itch.io" },
  { value: "mail", label: "Correo" },
  { value: "github", label: "GitHub" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
]

const lucideIcons = [
  { value: "book", label: "Libro" },
  { value: "table", label: "Tabla" },
  { value: "wrench", label: "Llave" },
  { value: "code", label: "Código" },
  { value: "git", label: "Ramas" },
]

export function HomeForm({ value, lang, onChange }: FormProps<HomeContent>) {
  const set = (patch: Partial<HomeContent>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-col gap-6">
      <Group title="Portada" hint="El bloque grande de arriba, con la foto.">
        <BiField label="Etiqueta superior" value={value.badge} lang={lang} onChange={(badge) => set({ badge })} />
        <TextField label="Nivel" value={value.level} onChange={(level) => set({ level })} hint="El número del círculo junto a la foto." />
        <BiField label="Título, primera línea" value={value.title1} lang={lang} onChange={(title1) => set({ title1 })} />
        <BiField label="Título destacado" value={value.title2} lang={lang} onChange={(title2) => set({ title2 })} />
        <BiField label="Título, segunda línea" value={value.title3} lang={lang} onChange={(title3) => set({ title3 })} />
        <BiField label="Subtítulo" value={value.subtitle} lang={lang} onChange={(subtitle) => set({ subtitle })} />
        <BiField label="Clase" value={value.classLabel} lang={lang} onChange={(classLabel) => set({ classLabel })} />
        <BiField label="Especialización" value={value.spec} lang={lang} onChange={(spec) => set({ spec })} />
        <BiField label="Región" value={value.region} lang={lang} onChange={(region) => set({ region })} />
        <BiField label="Botón de videojuegos" value={value.ctaGames} lang={lang} onChange={(ctaGames) => set({ ctaGames })} />
        <BiField label="Botón de proyectos" value={value.ctaProjects} lang={lang} onChange={(ctaProjects) => set({ ctaProjects })} />
        <BiField label="Botón de contacto" value={value.ctaContact} lang={lang} onChange={(ctaContact) => set({ ctaContact })} />
        <BiField label="Texto de bajar" value={value.scrollDown} lang={lang} onChange={(scrollDown) => set({ scrollDown })} />
      </Group>
      <Group title="Barra de estado" hint="La barra fija de abajo: objetivo y ubicación.">
        <BiField label="Etiqueta de objetivo" value={value.objectiveLabel} lang={lang} onChange={(objectiveLabel) => set({ objectiveLabel })} />
        <BiField label="Objetivo" value={value.objectiveValue} lang={lang} onChange={(objectiveValue) => set({ objectiveValue })} />
        <BiField label="Etiqueta de ubicación" value={value.locationLabel} lang={lang} onChange={(locationLabel) => set({ locationLabel })} />
        <BiField label="Ubicación" value={value.locationValue} lang={lang} onChange={(locationValue) => set({ locationValue })} />
      </Group>
      <Group title="Pie de la página de inicio">
        <BiField label="Crédito" value={value.footerCredit} lang={lang} onChange={(footerCredit) => set({ footerCredit })} />
        <BiField label="Nombre" value={value.footerName} lang={lang} onChange={(footerName) => set({ footerName })} />
        <BiField label="Línea inferior" value={value.footerTagline} lang={lang} onChange={(footerTagline) => set({ footerTagline })} />
      </Group>
      <Group title="Videojuegos destacados" hint="Solo el título de esa sección. Los juegos se editan en Mis Videojuegos.">
        <BiField label="Etiqueta" value={value.featuredKicker} lang={lang} onChange={(featuredKicker) => set({ featuredKicker })} />
        <BiField label="Título" value={value.featuredTitle} lang={lang} onChange={(featuredTitle) => set({ featuredTitle })} />
        <BiField label="Subtítulo" value={value.featuredSubtitle} lang={lang} onChange={(featuredSubtitle) => set({ featuredSubtitle })} multiline />
        <BiField label="Texto si no hay juegos" value={value.featuredEmpty} lang={lang} onChange={(featuredEmpty) => set({ featuredEmpty })} />
        <BiField label="Botón ver todos" value={value.featuredSeeAll} lang={lang} onChange={(featuredSeeAll) => set({ featuredSeeAll })} />
      </Group>
    </div>
  )
}

export function AboutForm({ value, lang, onChange }: FormProps<AboutContent>) {
  const set = (patch: Partial<AboutContent>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-col gap-6">
      <Group title="Encabezado">
        <BiField label="Etiqueta" value={value.label} lang={lang} onChange={(label) => set({ label })} />
        <BiField label="Título" value={value.titlePart1} lang={lang} onChange={(titlePart1) => set({ titlePart1 })} />
        <TextField label="Año destacado" value={value.titleYear} onChange={(titleYear) => set({ titleYear })} />
      </Group>
      <Group title="Párrafos" hint="Cada párrafo es un bloque. El orden es el de la página.">
        {value.paragraphs.map((paragraph, index) => (
          <ItemCard
            key={`paragraph-${index}`}
            title={paragraph[lang] || `Párrafo ${index + 1}`}
            index={index}
            count={value.paragraphs.length}
            kind="paragraph"
            onMove={(from, to) => set({ paragraphs: moveItem(value.paragraphs, from, to) })}
            onRemove={() => set({ paragraphs: value.paragraphs.filter((_, i) => i !== index) })}
          >
            <BiField
              label="Texto"
              value={paragraph}
              lang={lang}
              multiline
              onChange={(next) => set({ paragraphs: value.paragraphs.map((item, i) => (i === index ? next : item)) })}
            />
          </ItemCard>
        ))}
        {value.paragraphs.length < 12 ? (
          <AddButton label="Agregar párrafo" onClick={() => set({ paragraphs: [...value.paragraphs, emptyText()] })} />
        ) : null}
      </Group>
      <Group title="Tarjetas">
        {value.stats.map((stat, index) => (
          <ItemCard
            key={stat.id}
            title={(stat.useGameCount ? stat.countSuffix[lang] : stat.title[lang]) || `Tarjeta ${index + 1}`}
            index={index}
            count={value.stats.length}
            kind="stat"
            onMove={(from, to) => set({ stats: moveItem(value.stats, from, to) })}
            onRemove={() => set({ stats: value.stats.filter((_, i) => i !== index) })}
          >
            <SelectField
              label="Icono"
              value={stat.icon}
              options={iconOptions}
              onChange={(icon) =>
                set({ stats: value.stats.map((item, i) => (i === index ? { ...item, icon: icon as AboutContent["stats"][number]["icon"] } : item)) })
              }
            />
            <CheckField
              label="Usar la cantidad de juegos publicados"
              checked={stat.useGameCount}
              hint="El número sale solo de Mis Videojuegos. Acá editas la palabra que va después."
              onChange={(useGameCount) => set({ stats: value.stats.map((item, i) => (i === index ? { ...item, useGameCount } : item)) })}
            />
            {stat.useGameCount ? (
              <BiField
                label="Palabra junto al número"
                value={stat.countSuffix}
                lang={lang}
                onChange={(countSuffix) => set({ stats: value.stats.map((item, i) => (i === index ? { ...item, countSuffix } : item)) })}
              />
            ) : (
              <BiField
                label="Título"
                value={stat.title}
                lang={lang}
                onChange={(title) => set({ stats: value.stats.map((item, i) => (i === index ? { ...item, title } : item)) })}
              />
            )}
            <BiField
              label="Descripción"
              value={stat.description}
              lang={lang}
              onChange={(description) => set({ stats: value.stats.map((item, i) => (i === index ? { ...item, description } : item)) })}
            />
          </ItemCard>
        ))}
        {value.stats.length < 8 ? (
          <AddButton
            label="Agregar tarjeta"
            onClick={() =>
              set({
                stats: [
                  ...value.stats,
                  { id: newId("stat"), icon: "gamepad", useGameCount: false, title: emptyText(), countSuffix: { es: "juegos", en: "games" }, description: emptyText() },
                ],
              })
            }
          />
        ) : null}
      </Group>
    </div>
  )
}

export function ExperienceForm({ value, lang, onChange }: FormProps<ExperienceContent>) {
  const set = (patch: Partial<ExperienceContent>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-col gap-6">
      <Group title="Encabezado">
        <BiField label="Título" value={value.title} lang={lang} onChange={(title) => set({ title })} />
        <BiField label="Subtítulo" value={value.subtitle} lang={lang} multiline onChange={(subtitle) => set({ subtitle })} />
        <BiField label="Nombre del tipo Trabajo" value={value.typeWork} lang={lang} onChange={(typeWork) => set({ typeWork })} />
        <BiField label="Nombre del tipo Proyecto" value={value.typeProject} lang={lang} onChange={(typeProject) => set({ typeProject })} />
        <BiField label="Nombre del tipo Hito" value={value.typeMilestone} lang={lang} onChange={(typeMilestone) => set({ typeMilestone })} />
        <BiField label="Título de logros" value={value.achievements} lang={lang} onChange={(achievements) => set({ achievements })} />
        <BiField label="Botón de lore" value={value.readMore} lang={lang} onChange={(readMore) => set({ readMore })} />
        <BiField label="Texto cuando no hay nada seleccionado" value={value.selectPrompt} lang={lang} multiline onChange={(selectPrompt) => set({ selectPrompt })} />
      </Group>
      <Group title="Entradas" hint="Arrastra el asa o usa las flechas para cambiar el orden.">
        {value.items.map((item, index) => (
          <ItemCard
            key={item.id}
            title={item.title[lang] || `Experiencia ${index + 1}`}
            index={index}
            count={value.items.length}
            kind="exp"
            onMove={(from, to) => set({ items: moveItem(value.items, from, to) })}
            onRemove={() => set({ items: value.items.filter((_, i) => i !== index) })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Año" value={item.year} onChange={(year) => set({ items: value.items.map((entry, i) => (i === index ? { ...entry, year } : entry)) })} />
              <SelectField
                label="Tipo"
                value={item.type}
                options={experienceTypes}
                onChange={(type) =>
                  set({ items: value.items.map((entry, i) => (i === index ? { ...entry, type: type as ExperienceContent["items"][number]["type"] } : entry)) })
                }
              />
            </div>
            <BiField label="Título" value={item.title} lang={lang} onChange={(title) => set({ items: value.items.map((entry, i) => (i === index ? { ...entry, title } : entry)) })} />
            <BiField label="Lugar o equipo" value={item.company} lang={lang} onChange={(company) => set({ items: value.items.map((entry, i) => (i === index ? { ...entry, company } : entry)) })} />
            <BiField label="Resumen" value={item.overview} lang={lang} multiline onChange={(overview) => set({ items: value.items.map((entry, i) => (i === index ? { ...entry, overview } : entry)) })} />
            <CheckField
              label="Mostrar el botón de lore"
              checked={item.showReadMore}
              hint="El botón abre el blog."
              onChange={(showReadMore) => set({ items: value.items.map((entry, i) => (i === index ? { ...entry, showReadMore } : entry)) })}
            />
            <div className="flex flex-col gap-3">
              <p className="font-mono text-xs text-muted-foreground">Logros</p>
              {item.highlights.map((highlight, highlightIndex) => (
                <div key={`${item.id}-h-${highlightIndex}`} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <BiField
                      label={`Logro ${highlightIndex + 1}`}
                      value={highlight}
                      lang={lang}
                      onChange={(next) =>
                        set({
                          items: value.items.map((entry, i) =>
                            i === index ? { ...entry, highlights: entry.highlights.map((line, j) => (j === highlightIndex ? next : line)) } : entry,
                          ),
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="mt-6 h-8 w-8 hover:text-destructive"
                    aria-label="Quitar logro"
                    onClick={() =>
                      set({
                        items: value.items.map((entry, i) =>
                          i === index ? { ...entry, highlights: entry.highlights.filter((_, j) => j !== highlightIndex) } : entry,
                        ),
                      })
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
              {item.highlights.length < 16 ? (
                <AddButton
                  label="Agregar logro"
                  onClick={() =>
                    set({
                      items: value.items.map((entry, i) => (i === index ? { ...entry, highlights: [...entry.highlights, emptyText()] } : entry)),
                    })
                  }
                />
              ) : null}
            </div>
          </ItemCard>
        ))}
        {value.items.length < 24 ? (
          <AddButton
            label="Agregar experiencia"
            onClick={() =>
              set({
                items: [
                  ...value.items,
                  {
                    id: newId("exp"),
                    year: String(new Date().getFullYear()),
                    type: "work",
                    title: emptyText(),
                    company: emptyText(),
                    overview: emptyText(),
                    highlights: [],
                    showReadMore: false,
                  },
                ],
              })
            }
          />
        ) : null}
      </Group>
    </div>
  )
}

export function ToolsForm({ value, lang, onChange }: FormProps<ToolsContent>) {
  const set = (patch: Partial<ToolsContent>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-col gap-6">
      <Group title="Encabezado">
        <BiField label="Título" value={value.title} lang={lang} onChange={(title) => set({ title })} />
        <BiField label="Subtítulo" value={value.subtitle} lang={lang} multiline onChange={(subtitle) => set({ subtitle })} />
        <BiField label="Etiqueta del porcentaje" value={value.mastery} lang={lang} onChange={(mastery) => set({ mastery })} />
      </Group>
      <Group title="Grupos" hint="Cada grupo tiene sus herramientas. Arrastra para reordenar.">
        {value.groups.map((group, groupIndex) => (
          <ItemCard
            key={group.id}
            title={group.name[lang] || `Grupo ${groupIndex + 1}`}
            index={groupIndex}
            count={value.groups.length}
            kind="group"
            onMove={(from, to) => set({ groups: moveItem(value.groups, from, to) })}
            onRemove={() => set({ groups: value.groups.filter((_, i) => i !== groupIndex) })}
          >
            <BiField
              label="Nombre del grupo"
              value={group.name}
              lang={lang}
              onChange={(name) => set({ groups: value.groups.map((item, i) => (i === groupIndex ? { ...item, name } : item)) })}
            />
            {group.tools.map((tool, toolIndex) => (
              <ItemCard
                key={tool.id}
                title={tool.name[lang] || `Herramienta ${toolIndex + 1}`}
                index={toolIndex}
                count={group.tools.length}
                kind={`tool-${group.id}`}
                onMove={(from, to) =>
                  set({
                    groups: value.groups.map((item, i) => (i === groupIndex ? { ...item, tools: moveItem(item.tools, from, to) } : item)),
                  })
                }
                onRemove={() =>
                  set({
                    groups: value.groups.map((item, i) =>
                      i === groupIndex ? { ...item, tools: item.tools.filter((_, j) => j !== toolIndex) } : item,
                    ),
                  })
                }
              >
                <BiField
                  label="Nombre"
                  value={tool.name}
                  lang={lang}
                  onChange={(name) =>
                    set({
                      groups: value.groups.map((item, i) =>
                        i === groupIndex ? { ...item, tools: item.tools.map((entry, j) => (j === toolIndex ? { ...entry, name } : entry)) } : item,
                      ),
                    })
                  }
                />
                <BiField
                  label="Categoría"
                  value={tool.category}
                  lang={lang}
                  hint="Por ejemplo Motor, Narrativa o Gestión."
                  onChange={(category) =>
                    set({
                      groups: value.groups.map((item, i) =>
                        i === groupIndex
                          ? { ...item, tools: item.tools.map((entry, j) => (j === toolIndex ? { ...entry, category } : entry)) }
                          : item,
                      ),
                    })
                  }
                />
                <NumberField
                  label="Dominio (%)"
                  value={tool.proficiency}
                  onChange={(proficiency) =>
                    set({
                      groups: value.groups.map((item, i) =>
                        i === groupIndex
                          ? { ...item, tools: item.tools.map((entry, j) => (j === toolIndex ? { ...entry, proficiency } : entry)) }
                          : item,
                      ),
                    })
                  }
                />
                <SelectField
                  label="Icono"
                  value={tool.icon.type}
                  options={[
                    { value: "brand", label: "Logo de la marca" },
                    { value: "lucide", label: "Icono simple" },
                  ]}
                  onChange={(type) =>
                    set({
                      groups: value.groups.map((item, i) =>
                        i === groupIndex
                          ? {
                              ...item,
                              tools: item.tools.map((entry, j) =>
                                j === toolIndex
                                  ? {
                                      ...entry,
                                      icon: type === "brand" ? { type: "brand", slug: "godotengine" } : { type: "lucide", name: "wrench" },
                                    }
                                  : entry,
                              ),
                            }
                          : item,
                      ),
                    })
                  }
                />
                {tool.icon.type === "brand" ? (
                  <TextField
                    label="Identificador del logo"
                    value={tool.icon.slug}
                    hint="El nombre en simpleicons.org, por ejemplo godotengine, unity o figma."
                    onChange={(slug) =>
                      set({
                        groups: value.groups.map((item, i) =>
                          i === groupIndex
                            ? {
                                ...item,
                                tools: item.tools.map((entry, j) =>
                                  j === toolIndex
                                    ? { ...entry, icon: { type: "brand", slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") } }
                                    : entry,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                ) : (
                  <SelectField
                    label="Dibujo"
                    value={tool.icon.name}
                    options={lucideIcons}
                    onChange={(name) =>
                      set({
                        groups: value.groups.map((item, i) =>
                          i === groupIndex
                            ? {
                                ...item,
                                tools: item.tools.map((entry, j) =>
                                  j === toolIndex ? { ...entry, icon: { type: "lucide", name: name as LucideTool } } : entry,
                                ),
                              }
                            : item,
                        ),
                      })
                    }
                  />
                )}
              </ItemCard>
            ))}
            {group.tools.length < 16 ? (
              <AddButton
                label="Agregar herramienta"
                onClick={() =>
                  set({
                    groups: value.groups.map((item, i) =>
                      i === groupIndex
                        ? {
                            ...item,
                            tools: [
                              ...item.tools,
                              { id: newId("tool"), name: emptyText(), category: emptyText(), proficiency: 50, icon: { type: "lucide", name: "wrench" } },
                            ],
                          }
                        : item,
                    ),
                  })
                }
              />
            ) : null}
          </ItemCard>
        ))}
        {value.groups.length < 8 ? (
          <AddButton
            label="Agregar grupo"
            onClick={() => set({ groups: [...value.groups, { id: newId("group"), name: emptyText(), tools: [] }] })}
          />
        ) : null}
      </Group>
    </div>
  )
}

export function MissionsForm({ value, lang, onChange }: FormProps<MissionsContent>) {
  const set = (patch: Partial<MissionsContent>) => onChange({ ...value, ...patch })
  return (
    <div className="flex flex-col gap-6">
      <Group title="Encabezado">
        <BiField label="Título" value={value.title} lang={lang} onChange={(title) => set({ title })} />
        <BiField label="Subtítulo" value={value.subtitle} lang={lang} multiline onChange={(subtitle) => set({ subtitle })} />
        <BiField label="Botón de aceptar" value={value.accept} lang={lang} onChange={(accept) => set({ accept })} />
        <BiField label="Etiqueta de requisitos" value={value.requirementsLabel} lang={lang} onChange={(requirementsLabel) => set({ requirementsLabel })} />
        <BiField label="Etiqueta de recompensa" value={value.rewardLabel} lang={lang} onChange={(rewardLabel) => set({ rewardLabel })} />
        <BiField label="Texto de redes" value={value.findMe} lang={lang} onChange={(findMe) => set({ findMe })} />
      </Group>
      <Group title="Nombres de dificultad" hint="El color de cada tarjeta depende de la dificultad elegida en la misión, no de estas palabras.">
        <BiField label="Fácil" value={value.difficultyEasy} lang={lang} onChange={(difficultyEasy) => set({ difficultyEasy })} />
        <BiField label="Normal" value={value.difficultyNormal} lang={lang} onChange={(difficultyNormal) => set({ difficultyNormal })} />
        <BiField label="Legendario" value={value.difficultyLegendary} lang={lang} onChange={(difficultyLegendary) => set({ difficultyLegendary })} />
      </Group>
      <Group title="Formulario">
        <BiField label="Texto de apertura" value={value.completeForm} lang={lang} onChange={(completeForm) => set({ completeForm })} />
        <BiField label="Etiqueta de nombre" value={value.nameLabel} lang={lang} onChange={(nameLabel) => set({ nameLabel })} />
        <BiField label="Placeholder de nombre" value={value.namePlaceholder} lang={lang} onChange={(namePlaceholder) => set({ namePlaceholder })} />
        <BiField label="Etiqueta de email" value={value.emailLabel} lang={lang} onChange={(emailLabel) => set({ emailLabel })} />
        <BiField label="Placeholder de email" value={value.emailPlaceholder} lang={lang} onChange={(emailPlaceholder) => set({ emailPlaceholder })} />
        <BiField label="Pregunta de freelance" value={value.describeProject} lang={lang} onChange={(describeProject) => set({ describeProject })} />
        <BiField label="Pregunta de entrevista" value={value.describePosition} lang={lang} onChange={(describePosition) => set({ describePosition })} />
        <BiField label="Pregunta de feedback y prueba" value={value.linkGame} lang={lang} onChange={(linkGame) => set({ linkGame })} />
        <BiField label="Placeholder del mensaje" value={value.messagePlaceholder} lang={lang} onChange={(messagePlaceholder) => set({ messagePlaceholder })} />
        <BiField label="Cancelar" value={value.cancel} lang={lang} onChange={(cancel) => set({ cancel })} />
        <BiField label="Enviar" value={value.send} lang={lang} onChange={(send) => set({ send })} />
      </Group>
      <Group title="Misiones">
        {value.quests.map((quest, index) => (
          <ItemCard
            key={quest.id}
            title={quest.title[lang] || `Misión ${index + 1}`}
            index={index}
            count={value.quests.length}
            kind="quest"
            onMove={(from, to) => set({ quests: moveItem(value.quests, from, to) })}
            onRemove={() => set({ quests: value.quests.filter((_, i) => i !== index) })}
          >
            <SelectField
              label="Tipo"
              value={quest.kind}
              options={questKinds}
              hint="Define el icono y la pregunta del formulario."
              onChange={(kind) =>
                set({ quests: value.quests.map((item, i) => (i === index ? { ...item, kind: kind as MissionsContent["quests"][number]["kind"] } : item)) })
              }
            />
            <SelectField
              label="Dificultad"
              value={quest.difficulty}
              options={difficulties}
              onChange={(difficulty) =>
                set({
                  quests: value.quests.map((item, i) =>
                    i === index ? { ...item, difficulty: difficulty as MissionsContent["quests"][number]["difficulty"] } : item,
                  ),
                })
              }
            />
            <BiField label="Título" value={quest.title} lang={lang} onChange={(title) => set({ quests: value.quests.map((item, i) => (i === index ? { ...item, title } : item)) })} />
            <BiField label="Descripción" value={quest.description} lang={lang} multiline onChange={(description) => set({ quests: value.quests.map((item, i) => (i === index ? { ...item, description } : item)) })} />
            <BiField label="Requisitos" value={quest.requirements} lang={lang} onChange={(requirements) => set({ quests: value.quests.map((item, i) => (i === index ? { ...item, requirements } : item)) })} />
            <BiField label="Recompensa" value={quest.reward} lang={lang} onChange={(reward) => set({ quests: value.quests.map((item, i) => (i === index ? { ...item, reward } : item)) })} />
          </ItemCard>
        ))}
        {value.quests.length < 12 ? (
          <AddButton
            label="Agregar misión"
            onClick={() =>
              set({
                quests: [
                  ...value.quests,
                  {
                    id: newId("quest"),
                    kind: "feedback",
                    difficulty: "normal",
                    title: emptyText(),
                    description: emptyText(),
                    requirements: emptyText(),
                    reward: emptyText(),
                  },
                ],
              })
            }
          />
        ) : null}
      </Group>
      <Group title="Enlaces" hint="Los botones de abajo del tablero. La dirección tiene que empezar por https:// o mailto:.">
        {value.socials.map((social, index) => (
          <ItemCard
            key={social.id}
            title={social.name || `Enlace ${index + 1}`}
            index={index}
            count={value.socials.length}
            kind="social"
            onMove={(from, to) => set({ socials: moveItem(value.socials, from, to) })}
            onRemove={() => set({ socials: value.socials.filter((_, i) => i !== index) })}
          >
            <TextField label="Nombre" value={social.name} onChange={(name) => set({ socials: value.socials.map((item, i) => (i === index ? { ...item, name } : item)) })} />
            <TextField label="Dirección" value={social.href} onChange={(href) => set({ socials: value.socials.map((item, i) => (i === index ? { ...item, href } : item)) })} />
            <SelectField
              label="Icono"
              value={social.icon}
              options={socialIcons}
              onChange={(icon) =>
                set({ socials: value.socials.map((item, i) => (i === index ? { ...item, icon: icon as MissionsContent["socials"][number]["icon"] } : item)) })
              }
            />
          </ItemCard>
        ))}
        {value.socials.length < 12 ? (
          <AddButton
            label="Agregar enlace"
            onClick={() => set({ socials: [...value.socials, { id: newId("social"), name: "", href: "https://", icon: "mail" }] })}
          />
        ) : null}
      </Group>
    </div>
  )
}
