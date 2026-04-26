// Project status types
export type ProjectStatus = "idea" | "in-progress" | "abandoned" | "future"
export type Platform = "PC" | "Consola" | "Mobile"
export type DocumentType = "GDD" | "Documento" | "Presentación" | "Video"

export interface ProjectResource {
  type: DocumentType
  label: string
  url: string
}

export interface Project {
  id: number
  slug: string
  title: string
  description: string
  longDescription: string
  status: ProjectStatus
  platforms: Platform[]
  genres: string[]
  tags: string[]
  date: string
  coverImage: string
  screenshots: string[]
  screenshotCaptions?: string[]
  resources: ProjectResource[]
}

// Sample projects data
export const projectsData: Project[] = [
  {
    id: 1,
    slug: "sistema-crafting-modular",
    title: "Sistema de Crafting Modular",
    description: "Un sistema de crafting flexible para RPGs con recetas descubribles y combinaciones emergentes.",
    longDescription: "Este proyecto explora un enfoque modular para sistemas de crafting en RPGs. La idea central es permitir que los jugadores descubran recetas a través de la experimentación, creando una sensación de descubrimiento y agency. El sistema soporta ingredientes con propiedades múltiples, permitiendo combinaciones emergentes que el diseñador no necesita predefinir explícitamente.\n\nEl prototipo incluye un editor visual de recetas, un sistema de hints contextuales, y métricas de tracking para analizar qué combinaciones intentan los jugadores.",
    status: "in-progress",
    platforms: ["PC"],
    genres: ["RPG", "Sistemas"],
    tags: ["Godot", "GDScript", "UI/UX"],
    date: "2024-03",
    coverImage: "/project-1.jpg",
    screenshots: ["/project-1.jpg", "/game-1-ss1.jpg", "/game-1-ss2.jpg"],
    screenshotCaptions: [
      "Vista general del sistema de crafting con el editor de recetas.",
      "Interfaz de slots de ingredientes y panel de propiedades.",
      "Métricas de combinaciones intentadas por los jugadores.",
    ],
    resources: [
      { type: "GDD", label: "Documento de Diseño", url: "#" },
      { type: "Presentación", label: "Pitch Deck", url: "#" },
    ],
  },
  {
    id: 2,
    slug: "roguelike-narrativo",
    title: "Roguelike Narrativo",
    description: "Concepto de un roguelike donde las historias de runs anteriores afectan las futuras.",
    longDescription: "Una exploración de cómo integrar narrativa persistente en la estructura de un roguelike. Cada run genera una historia procedural que se convierte en lore para runs futuras. Los NPCs recuerdan héroes caídos, y ciertos items se convierten en reliquias con historia.\n\nEl proyecto quedó en fase conceptual debido a la complejidad técnica de mantener coherencia narrativa a largo plazo sin generar contradicciones.",
    status: "abandoned",
    platforms: ["PC", "Consola"],
    genres: ["Roguelike", "Narrativo"],
    tags: ["Unity", "C#", "Narrativa"],
    date: "2023-08",
    coverImage: "/project-2.jpg",
    screenshots: ["/project-2.jpg", "/game-2-ss1.jpg", "/game-2-ss2.jpg"],
    screenshotCaptions: [
      "Arte conceptual del hub entre runs con reliquias de héroes anteriores.",
      "Diagrama de flujo de la generación de narrativa procedural.",
      "Prototipo de la interfaz de NPCs con memoria de runs pasadas.",
    ],
    resources: [
      { type: "GDD", label: "Concepto Inicial", url: "#" },
    ],
  },
  {
    id: 3,
    slug: "editor-niveles-ingame",
    title: "Editor de Niveles In-Game",
    description: "Herramienta para que jugadores creen y compartan sus propios niveles dentro del juego.",
    longDescription: "Un sistema completo de edición de niveles diseñado para ser accesible a jugadores sin experiencia técnica. Incluye un sistema de snap-to-grid, validación automática de niveles jugables, y exportación a formato JSON para compartir.\n\nEl proyecto está en desarrollo activo como parte de un platformer cooperativo más grande.",
    status: "in-progress",
    platforms: ["PC", "Mobile"],
    genres: ["Herramientas", "Platformer"],
    tags: ["Godot", "GDScript", "Level Design"],
    date: "2024-01",
    coverImage: "/project-3.jpg",
    screenshots: ["/project-3.jpg", "/game-3-ss1.jpg", "/game-3-ss2.jpg"],
    screenshotCaptions: [
      "Interfaz principal del editor con grid y paleta de tiles.",
      "Sistema de validación automática resaltando rutas bloqueadas.",
      "Panel de exportación y previsualización del nivel generado.",
    ],
    resources: [
      { type: "GDD", label: "Especificación Técnica", url: "#" },
      { type: "Video", label: "Demo en Video", url: "#" },
    ],
  },
  {
    id: 4,
    slug: "dialogos-procedurales",
    title: "Sistema de Diálogos Procedurales",
    description: "Generación de diálogos contextualmente relevantes usando templates y variables.",
    longDescription: "Una alternativa a árboles de diálogo tradicionales que genera respuestas de NPCs basándose en su personalidad, relación con el jugador, y eventos recientes del juego. Usa un sistema de templates con variables que se resuelven en runtime.\n\nLa idea surgió de la frustración con sistemas de diálogo estáticos que no reflejan el estado del mundo del juego.",
    status: "idea",
    platforms: ["PC"],
    genres: ["RPG", "Narrativo"],
    tags: ["Diseño", "Narrativa", "IA"],
    date: "2024-02",
    coverImage: "/project-4.jpg",
    screenshots: ["/project-4.jpg", "/game-4-ss1.jpg"],
    screenshotCaptions: [
      "Diagrama del sistema de templates con variables contextuales.",
      "Ejemplo de árbol de diálogo generado en runtime.",
    ],
    resources: [
      { type: "Documento", label: "Notas de Diseño", url: "#" },
    ],
  },
  {
    id: 5,
    slug: "rhythm-combat-system",
    title: "Rhythm Combat System",
    description: "Sistema de combate donde el timing musical determina la efectividad de las acciones.",
    longDescription: "Un sistema híbrido entre juegos de ritmo y RPGs de acción. Cada enemigo tiene un patrón rítmico único, y los ataques del jugador son más efectivos cuando se sincronizan con el beat. El sistema incluye feedback visual y háptico para ayudar a los jugadores a encontrar el ritmo.\n\nPlaneado como un vertical slice para demostrar el concepto antes de buscar financiamiento.",
    status: "future",
    platforms: ["PC", "Consola", "Mobile"],
    genres: ["Acción", "Ritmo"],
    tags: ["Unity", "Audio", "Combat"],
    date: "2024-06",
    coverImage: "/project-5.jpg",
    screenshots: ["/project-5.jpg", "/game-5-ss1.jpg", "/game-5-ss2.jpg"],
    screenshotCaptions: [
      "Concepto visual del indicador de ritmo sincronizado con el combate.",
      "Patrones rítmicos únicos de tres tipos de enemigos distintos.",
      "Prototipo de la interfaz de combo con feedback háptico.",
    ],
    resources: [
      { type: "GDD", label: "Design Document", url: "#" },
      { type: "Presentación", label: "Concept Pitch", url: "#" },
      { type: "Video", label: "Reference Reel", url: "#" },
    ],
  },
  {
    id: 6,
    slug: "economia-emergente-mmo",
    title: "Economía Emergente para MMO",
    description: "Simulación de una economía de jugadores con recursos finitos y crafting.",
    longDescription: "Un estudio teórico sobre cómo diseñar economías de jugadores que se auto-regulen sin intervención constante de desarrolladores. Explora conceptos como sinks y faucets dinámicos, impuestos progresivos invisibles, y mercados regionales.\n\nEl proyecto incluye una simulación en Python que modela miles de agentes económicos.",
    status: "abandoned",
    platforms: ["PC"],
    genres: ["MMO", "Simulación"],
    tags: ["Python", "Economía", "Sistemas"],
    date: "2023-05",
    coverImage: "/project-6.jpg",
    screenshots: ["/project-6.jpg", "/game-6-ss1.jpg"],
    screenshotCaptions: [
      "Simulación de curvas de oferta y demanda con 10.000 agentes.",
      "Mapa regional mostrando flujos de recursos entre zonas.",
    ],
    resources: [
      { type: "Documento", label: "Research Paper", url: "#" },
      { type: "Presentación", label: "Slides", url: "#" },
    ],
  },
]

export const statusConfig = {
  idea: { 
    label: "Idea", 
    labelEn: "Idea",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
  },
  "in-progress": { 
    label: "En Progreso", 
    labelEn: "In Progress",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
  },
  abandoned: { 
    label: "Abandonado", 
    labelEn: "Abandoned",
    color: "bg-red-500/20 text-red-400 border-red-500/30" 
  },
  future: { 
    label: "Idea a Futuro", 
    labelEn: "Future Idea",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
  },
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projectsData.find(p => p.slug === slug)
}

export function getAllProjectSlugs(): string[] {
  return projectsData.map(p => p.slug)
}
