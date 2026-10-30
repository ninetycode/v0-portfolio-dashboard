import type {
  AboutContent,
  Bilingual,
  ExperienceContent,
  HomeContent,
  MissionsContent,
  SiteContent,
  ToolsContent,
} from "./types"

function b(es: string, en: string): Bilingual {
  return { es, en }
}

function s(text: string): Bilingual {
  return { es: text, en: text }
}

const home: HomeContent = {
  badge: b("sistema_iniciado", "system_started"),
  level: "27",
  title1: b("Bienvenido al", "Welcome to"),
  title2: b("Centro de Mando", "Command Center"),
  title3: b("de Mathías Andino", "of Mathías Andino"),
  subtitle: b("Game Designer Junior & Godot Dev", "Junior Game Designer & Godot Dev"),
  classLabel: b("Clase: Game Designer Junior", "Class: Junior Game Designer"),
  spec: b("Especialización: Narrative", "Specialization: Narrative"),
  region: b("Región: Buenos Aires, Argentina.", "Region: Buenos Aires, Argentina."),
  ctaGames: b("Mis Videojuegos", "My Games"),
  ctaProjects: b("Proyectos", "Projects"),
  ctaContact: b("Contactame", "Contact Me"),
  scrollDown: b("desplazarse hacia abajo", "scroll down"),
  objectiveLabel: b("Objetivo:", "Objective:"),
  objectiveValue: s("Gamedev Job Hunt"),
  locationLabel: b("Ubicación:", "Location:"),
  locationValue: s("Buenos Aires, AR"),
  // The homepage footer is Spanish in both languages today. Keep that until it is edited.
  footerCredit: s("Diseñado y desarrollado por"),
  footerName: s("Mathías Andino"),
  footerTagline: s("2024 | Game Narrative Designer Junior | Buenos Aires, Argentina"),
  featuredKicker: s("PORTFOLIO"),
  featuredTitle: b("Videojuegos Destacados", "Featured Games"),
  featuredSubtitle: b(
    "Una selección de mis trabajos más recientes en desarrollo y diseño de videojuegos.",
    "A selection of my most recent work in game development and design.",
  ),
  featuredEmpty: b("Próximamente.", "Coming soon."),
  featuredSeeAll: b("Ver todos los videojuegos", "See all games"),
}

const about: AboutContent = {
  label: b("SOBRE MÍ", "ABOUT ME"),
  titlePart1: b("Creando mundos digitales interactivos desde", "Creating interactive digital worlds since"),
  titleYear: "2025",
  paragraphs: [
    b(
      "Soy Mathias Andino, Game Narrative Designer junior de Buenos Aires. Me enfoco en que la historia y las mecánicas cuenten lo mismo: diseño sistemas de juego en los que cada acción del jugador refuerza la narrativa, para que no haya disonancia ludonarrativa.",
      "I'm a Game Narrative Designer junior from Buenos Aires, Argentina, with 1 year of experience, currently finishing my degree in Video Game Production (UNPAZ). My focus is on creating gaming experiences that feel incredible — game feel is at the heart of everything I design.",
    ),
    b(
      "En Mask Power (Global Game Jam 2026) convertí el tema \"máscara\" en un sistema de poderes inspirado en dioses ancestrales, donde elegir la máscara correcta es el desafío. En A través de mis ojos, un juego serio hecho en equipo, trasladamos la sobrecarga sensorial de una niña con autismo a un enemigo que ataca con sonido.",
      "I specialize in gameplay mechanics design, progression systems, and interactive narrative. I use Godot as my main development engine and participated in the Global Game Jam, where I discovered my passion for creating under creative pressure.",
    ),
    b(
      "En Oneiric Dread le doy cohesión a la historia y al gameplay en un equipo de cinco personas, con una mecánica de cordura ligada a la contención emocional de la protagonista. Trabajo con Godot y herramientas de IA para prototipar y llegar rápido a versiones jugables, y cuido el game feel y los detalles que hacen que un juego se sienta bien.",
      "In Oneiric Dread, I bring cohesion to the story and gameplay as part of a five-person team, with a sanity mechanic tied to the protagonist's emotional containment. I work with Godot and AI tools to prototype and reach playable versions quickly, while caring about game feel and the details that make a game feel good.",
    ),
    b(
      "También me interesan la UX y la organización de proyectos. Estoy terminando la carrera de Producción de Videojuegos en la UNPAZ y busco sumarme a un equipo como Narrative Designer o Game Designer junior.",
      "I am also interested in UX and project organization. I am finishing my degree in Video Game Production at UNPAZ and looking to join a team as a Narrative Designer or Junior Game Designer.",
    ),
  ],
  stats: [
    {
      id: "stat-years",
      icon: "gamepad",
      useGameCount: false,
      title: b("1 año", "1 year"),
      countSuffix: b("juegos", "games"),
      description: b("Experiencia en desarrollo de videojuegos", "Experience in video game development"),
    },
    {
      id: "stat-games",
      icon: "code",
      useGameCount: true,
      title: b("3 juegos", "3 games"),
      countSuffix: b("juegos", "games"),
      description: b("Proyectos desarrollados y publicados", "Projects developed and published"),
    },
    {
      id: "stat-feel",
      icon: "target",
      useGameCount: false,
      title: s("Game Feel"),
      countSuffix: b("juegos", "games"),
      description: b("Enfoque en sensaciones de gameplay", "Focus on gameplay sensations"),
    },
    {
      id: "stat-jam",
      icon: "trophy",
      useGameCount: false,
      title: s("Global Game Jam"),
      countSuffix: b("juegos", "games"),
      description: b("Participación en jams internacionales", "Participation in international jams"),
    },
  ],
}

const experience: ExperienceContent = {
  title: b("Experiencia", "Experience"),
  subtitle: b(
    "Mi trayectoria en el desarrollo de videojuegos. Cada punto en esta línea representa un capítulo de aprendizaje y crecimiento.",
    "My journey in video game development. Each point on this timeline represents a chapter of learning and growth.",
  ),
  typeWork: b("Trabajo", "Work"),
  typeProject: b("Proyecto", "Project"),
  typeMilestone: b("Hito", "Milestone"),
  achievements: b("// Logros destacados", "// Notable achievements"),
  readMore: b("Leer Lore Completo", "Read Full Lore"),
  selectPrompt: b(
    "Selecciona un punto en la línea de tiempo para ver los detalles",
    "Select a point on the timeline to view details",
  ),
  items: [
    {
      id: "exp-2024",
      year: "2024",
      type: "work",
      showReadMore: true,
      title: s("Game Narrative Designer junior"),
      company: s("Indie Studio Collab"),
      overview: b(
        "Lideré el diseño técnico de un roguelike cooperativo, desde la conceptualización hasta el lanzamiento en Early Access.",
        "Led the technical design of a cooperative roguelike, from conceptualization to Early Access launch.",
      ),
      highlights: [
        b("Diseñé el sistema de progresión y metaprogresión", "Designed the progression and meta-progression system"),
        b("Implementé herramientas de debug para el equipo de QA", "Implemented debug tools for the QA team"),
        b(
          "Coordiné con programadores para optimizar sistemas core",
          "Coordinated with programmers to optimize core systems",
        ),
      ],
    },
    {
      id: "exp-2023",
      year: "2023",
      type: "project",
      showReadMore: true,
      title: s("Game Designer & Programmer"),
      company: s("Game Jam Team"),
      overview: b(
        "Participé en múltiples game jams, obteniendo Top 10 en Ludum Dare 54 con un puzzle game sobre limitaciones espaciales.",
        "Participated in multiple game jams, achieving Top 10 at Ludum Dare 54 with a puzzle game about spatial limitations.",
      ),
      highlights: [
        b("Desarrollé 4 juegos completos en 48-72 horas cada uno", "Developed 4 complete games in 48-72 hours each"),
        b("Iteré mecánicas basándome en feedback de jugadores", "Iterated mechanics based on player feedback"),
        b("Aprendí a priorizar features bajo presión de tiempo", "Learned to prioritize features under time pressure"),
      ],
    },
    {
      id: "exp-2022",
      year: "2022",
      type: "work",
      showReadMore: true,
      title: s("Junior Game Designer"),
      company: s("Mobile Games Studio"),
      overview: b(
        "Mi primer rol profesional en la industria. Trabajé en el diseño de niveles y economía de un puzzle mobile con 500K+ descargas.",
        "My first professional role in the industry. Worked on level design and economy for a mobile puzzle game with 500K+ downloads.",
      ),
      highlights: [
        b("Diseñé 50+ niveles con curva de dificultad progresiva", "Designed 50+ levels with progressive difficulty curve"),
        b("Analicé métricas de retención para optimizar el onboarding", "Analyzed retention metrics to optimize onboarding"),
        b(
          "Colaboré con el equipo de monetización en eventos especiales",
          "Collaborated with the monetization team on special events",
        ),
      ],
    },
    {
      id: "exp-2021",
      year: "2021",
      type: "milestone",
      showReadMore: false,
      title: b("Primeros Prototipos", "First Prototypes"),
      company: b("Proyectos Personales", "Personal Projects"),
      overview: b(
        "El año donde todo comenzó. Completé mis primeros prototipos jugables y descubrí mi pasión por el diseño técnico.",
        "The year where it all started. Completed my first playable prototypes and discovered my passion for technical design.",
      ),
      highlights: [
        b("Lancé mi primer juego en Itch.io", "Launched my first game on Itch.io"),
        b("Aprendí GDScript y los fundamentos de Godot", "Learned GDScript and the fundamentals of Godot"),
        b("Empecé a documentar mis procesos de diseño", "Started documenting my design processes"),
      ],
    },
    {
      id: "exp-2020",
      year: "2020",
      type: "milestone",
      showReadMore: false,
      title: b("Técnico en Computación", "Computer Technician"),
      company: b("Escuela Técnica", "Technical School"),
      overview: b(
        "Finalicé mis estudios técnicos con orientación en programación, sentando las bases para mi carrera en desarrollo de videojuegos.",
        "Completed my technical studies with a programming focus, laying the foundation for my career in game development.",
      ),
      highlights: [
        b("Aprendí fundamentos de programación en C y Python", "Learned programming fundamentals in C and Python"),
        b("Desarrollé proyectos de software como trabajo final", "Developed software projects as a final project"),
        b("Descubrí el mundo del game development", "Discovered the world of game development"),
      ],
    },
  ],
}

const tools: ToolsContent = {
  title: b("Inventario de Herramientas", "Tool Inventory"),
  subtitle: b(
    "Mi stack tecnológico para desarrollo de videojuegos.",
    "My tech stack for game development. Each tool is a weapon in my Game Designer arsenal.",
  ),
  mastery: b("Dominio", "Mastery"),
  groups: [
    {
      id: "group-engines",
      name: b("Motores & Lenguajes", "Engines & Languages"),
      tools: [
        { id: "godot", name: s("Godot"), category: b("Motor", "Engine"), proficiency: 85, icon: { type: "brand", slug: "godotengine" } },
        { id: "gdscript", name: s("GDScript"), category: b("Lenguaje", "Language"), proficiency: 70, icon: { type: "brand", slug: "godotengine" } },
        { id: "unity", name: s("Unity"), category: b("Motor", "Engine"), proficiency: 25, icon: { type: "brand", slug: "unity" } },
        { id: "csharp", name: s("C#"), category: b("Lenguaje", "Language"), proficiency: 25, icon: { type: "brand", slug: "dotnet" } },
      ],
    },
    {
      id: "group-narrative",
      name: b("Narrativa & Arte", "Narrative & Art"),
      tools: [
        { id: "twine", name: s("Twine"), category: b("Narrativa", "Narrative"), proficiency: 75, icon: { type: "lucide", name: "book" } },
        { id: "aseprite", name: s("Aseprite"), category: s("2D"), proficiency: 70, icon: { type: "brand", slug: "aseprite" } },
        { id: "figma", name: s("Figma"), category: s("UI/UX"), proficiency: 40, icon: { type: "brand", slug: "figma" } },
      ],
    },
    {
      id: "group-management",
      name: b("Gestión & Colaboración", "Management & Collaboration"),
      tools: [
        { id: "miro", name: s("Miro"), category: b("Gestión", "Management"), proficiency: 65, icon: { type: "brand", slug: "miro" } },
        { id: "jira", name: s("Jira"), category: b("Gestión", "Management"), proficiency: 60, icon: { type: "brand", slug: "jira" } },
        { id: "notion", name: s("Notion"), category: b("Gestión", "Management"), proficiency: 50, icon: { type: "brand", slug: "notion" } },
      ],
    },
    {
      id: "group-data",
      name: b("Datos & Versionado", "Data & Version Control"),
      tools: [
        {
          id: "sheets",
          name: s("Google Sheets / Excel"),
          category: b("Datos", "Data"),
          proficiency: 60,
          icon: { type: "lucide", name: "table" },
        },
        { id: "git", name: s("Git"), category: b("Versionado", "Version Control"), proficiency: 60, icon: { type: "brand", slug: "git" } },
      ],
    },
  ],
}

const missions: MissionsContent = {
  title: b("Tablero de Misiones", "Mission Board"),
  subtitle: b(
    "¿Tienes una misión para mí? Selecciona el tipo de colaboración que buscas y comencemos la aventura juntos.",
    "Do you have a mission for me? Select the type of collaboration you are looking for and let's start the adventure together.",
  ),
  accept: b("Aceptar Misión", "Accept Mission"),
  rewardLabel: b("Recompensa:", "Reward:"),
  requirementsLabel: b("Requisitos:", "Requirements:"),
  findMe: b("// O encuéntrame en:", "// Or find me at:"),
  completeForm: b("Completa el formulario para iniciar esta misión", "Complete the form to start this mission"),
  nameLabel: b("Nombre", "Name"),
  namePlaceholder: b("Tu nombre", "Your name"),
  emailLabel: s("Email"),
  emailPlaceholder: b("tu@email.com", "you@email.com"),
  cancel: b("Cancelar", "Cancel"),
  send: b("Enviar", "Send"),
  describeProject: b("Describe tu proyecto", "Describe your project"),
  describePosition: b("Cuéntame sobre la posición", "Tell me about the position"),
  linkGame: b("Link a tu juego + contexto", "Link to your game + context"),
  messagePlaceholder: b("Escribe tu mensaje aquí...", "Write your message here..."),
  difficultyEasy: b("Fácil", "Easy"),
  difficultyNormal: s("Normal"),
  difficultyLegendary: b("Legendario", "Legendary"),
  quests: [
    {
      id: "quest-feedback",
      kind: "feedback",
      difficulty: "easy",
      title: b("Misión: Feedback de Juego", "Mission: Game Feedback"),
      description: b(
        "¿Quieres que analice tu juego? Ofrezco feedback constructivo basado en mi experiencia.",
        "Do you want me to analyze your game? I offer constructive feedback based on my experience.",
      ),
      requirements: b("Juego jugable / Cualquier plataforma", "Playable build / Any platform"),
      reward: b("Análisis detallado + Sugerencias", "Detailed analysis + Suggestions"),
    },
    {
      id: "quest-hire",
      kind: "hire",
      difficulty: "normal",
      title: b("Misión: Contratación Freelance", "Mission: Freelance Hire"),
      description: b(
        "¿Necesitas un Game Designer para tu proyecto? Contáctame para discutir cómo puedo ayudarte.",
        "Do you need a Game Designer for your project? Contact me to discuss how I can help.",
      ),
      requirements: b("Proyecto definido / Presupuesto acordado", "Defined project / Agreed budget"),
      reward: b("Diseño de juegos profesional", "Professional game design"),
    },
    {
      id: "quest-playtest",
      kind: "playtest",
      difficulty: "normal",
      title: b("Misión: Prueba de Videojuego", "Mission: Game Playtesting"),
      description: b(
        "¿Necesitas que alguien pruebe tu juego en profundidad? Realizo playtesting, reporto bugs y genero informes detallados para que puedas iterar con datos reales.",
        "Need someone to thoroughly test your game? I do playtesting sessions, report bugs and generate detailed reports so you can iterate with real data.",
      ),
      requirements: b("Build accesible / Objetivos de prueba claros", "Accessible build / Clear test objectives"),
      reward: b("Informe de bugs + Reporte de sesión", "Bug report + Session report"),
    },
    {
      id: "quest-interview",
      kind: "interview",
      difficulty: "legendary",
      title: b("Misión: Entrevista Laboral", "Mission: Job Interview"),
      description: b(
        "Estoy buscando oportunidades de tiempo completo. Si tu estudio está contratando, hablemos.",
        "I am looking for full-time opportunities. If your studio is hiring, let's talk.",
      ),
      requirements: b(
        "Contrato full-time o part-time / Remoto, Híbrido o Presencial",
        "Full-time or part-time contract / Remote, Hybrid or On-site",
      ),
      reward: b("Un diseñador dedicado", "A dedicated designer"),
    },
  ],
  socials: [
    { id: "social-linkedin", name: "LinkedIn", href: "https://www.linkedin.com/in/mathias-andino/", icon: "linkedin" },
    { id: "social-itch", name: "Itch.io", href: "https://ninetygames.itch.io/", icon: "itch" },
    { id: "social-mail", name: "Gmail", href: "mailto:mathias.gamedesigner@gmail.com", icon: "mail" },
    { id: "social-github", name: "GitHub", href: "https://github.com/ninetycode", icon: "github" },
    { id: "social-instagram", name: "Instagram", href: "https://www.instagram.com/mathiasandino.ar", icon: "instagram" },
    { id: "social-youtube", name: "YouTube", href: "https://www.youtube.com/@Mattez", icon: "youtube" },
    { id: "social-x", name: "X", href: "https://x.com/mathigamedev", icon: "x" },
  ],
}

export const defaultSiteContent: SiteContent = {
  home,
  about,
  experience,
  tools,
  missions,
}
