"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Lang = "es" | "en"

export const translations = {
  es: {
    // Navbar
    nav: {
      home: "Inicio",
      about: "Sobre Mí",
      games: "Mis Videojuegos",
      projects: "Proyectos",
      experience: "Experiencia",
      skills: "Estudios",
      blog: "Blog",
      contact: "Contacto",
    },
    // StatusBar
    status: {
      objective: "Objetivo:",
      objectiveValue: "Gamedev Job Hunt",
      location: "Ubicación:",
      locationValue: "Buenos Aires, AR",
    },
    // Hero
    hero: {
      badge: "sistema_iniciado",
      title1: "Bienvenido al",
      title2: "Centro de Mando",
      title3: "de Mathías Andino",
      subtitle: "Technical Game Designer & Futuro Director Creativo",
      class: "Clase: Game Designer",
      spec: "Especialización: Technical",
      region: "Región: Argentina",
      ctaGames: "Mis Videojuegos",
      ctaProjects: "Proyectos",
      ctaContact: "Contactame",
      scrollDown: "desplazarse hacia abajo",
    },
    // AboutMe
    about: {
      label: "SOBRE MÍ",
      titlePart1: "Creando mundos digitales interactivos desde",
      titleYear: "2025",
      paragraph1: "Soy un Technical Game Designer de Buenos Aires, Argentina, con 1 año de experiencia, actualmente finalizando la carrera de Técnico/a en Producción de Videojuegos (UNPAZ). Mi enfoque está en crear experiencias de juego que se sientan increíbles — el game feel es el corazón de todo lo que diseño.",
      paragraph2: "Me especializo en el diseño de mecánicas de gameplay, sistemas de progresión y narrativa interactiva. Utilizo Godot como mi motor principal de desarrollo y participé en la Global Game Jam, donde descubrí mi pasión por crear bajo presión creativa.",
      paragraph3: "Con 3 videojuegos desarrollados y un primer lanzamiento comercial planeado para mediados de 2027, estoy construyendo mi camino hacia convertirme en Director Creativo. Cada proyecto es una oportunidad para perfeccionar el arte de hacer que los juegos se sientan satisfactorios.",
      stat1Title: "1 año",
      stat1Desc: "Experiencia en desarrollo de videojuegos",
      stat2Title: "3 juegos",
      stat2Desc: "Proyectos desarrollados y publicados",
      stat3Title: "Game Feel",
      stat3Desc: "Enfoque en sensaciones de gameplay",
      stat4Title: "Global Game Jam",
      stat4Desc: "Participación en jams internacionales",
    },
    // FeaturedGames
    featured: {
      title: "Videojuegos Destacados",
      seeAll: "Ver todos los videojuegos",
      filterAll: "Todos",
      filterComplete: "Juego Completo",
      filterJam: "Game Jam",
      filterWip: "En Desarrollo",
      games: [
        {
          title: "Hollow Depths",
          description: "Un metroidvania oscuro con mecánicas de combate fluidas y exploración no lineal.",
          genre: ["Metroidvania", "Acción"],
          type: "complete",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 0,
        },
        {
          title: "Pixel Survivor",
          description: "Sobrevive oleadas infinitas en este roguelike pixelado. Creado durante la Global Game Jam.",
          genre: ["Roguelike", "Supervivencia"],
          type: "jam",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 1,
        },
        {
          title: "Neon Circuit",
          description: "Resuelve circuitos en un mundo cyberpunk distópico. Actualmente en desarrollo activo.",
          genre: ["Puzzle", "Cyberpunk"],
          type: "wip",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 2,
        },
        {
          title: "Astro Drift",
          description: "Carreras anti-gravedad en pistas procedurales donde el drift es tu mejor arma.",
          genre: ["Racing", "Arcade"],
          type: "complete",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 3,
        },
      ],
    },
    // GamesGallery
    games: {
      title: "Mis Videojuegos",
      subtitle:
        "Una colección de proyectos en los que he participado como diseñador y/o programador. Cada uno representa un desafío único y aprendizajes valiosos.",
      seeDetails: "ver_detalles",
      role: "Tu Rol",
      challenge: "El Desafío Técnico",
      viewGDD: "Ver GDD",
      playDemo: "Jugar Demo",
      items: [
        {
          title: "Hollow Depths",
          description:
            "Un metroidvania oscuro con mecánicas de combate fluidas y exploración no lineal en las profundidades de una civilización olvidada.",
          role: "Technical Game Designer - Responsable del diseño de sistemas de combate, progresión del jugador y arquitectura de niveles. Implementé el sistema de habilidades desbloqueables y el mapa interconectado.",
          challenge:
            "El mayor desafío fue balancear la curva de dificultad mientras mantenía la sensación de descubrimiento. Implementamos un sistema de telemetría para ajustar los puntos de control y las recompensas basándonos en datos de playtest.",
          genre: ["Metroidvania", "Acción"],
        },
        {
          title: "Pixel Survivor",
          description:
            "Sobrevive oleadas infinitas de enemigos en este roguelike pixelado con builds procedurales y sinergias entre habilidades.",
          role: "Lead Designer - Diseñé el sistema de progresión roguelike, el árbol de habilidades y las mecánicas de supervivencia. Creé más de 50 items con efectos sinérgicos únicos.",
          challenge:
            "Crear variedad significativa en cada partida fue crítico. Desarrollamos un sistema de pesos dinámicos que ajusta la probabilidad de items según el build actual del jugador.",
          genre: ["Roguelike", "Supervivencia"],
        },
        {
          title: "Neon Circuit",
          description:
            "Resuelve circuitos lógicos en un mundo cyberpunk distópico donde cada puzzle revela fragmentos de una conspiración corporativa.",
          role: "Game Designer & Programmer - Diseñé los puzzles de circuitos y la progresión narrativa. Programé el sistema de validación de circuitos y las animaciones de UI.",
          challenge:
            "Equilibrar la dificultad de los puzzles para usuarios casual y hardcore. Implementamos un sistema de hints progresivo y múltiples soluciones válidas por nivel.",
          genre: ["Puzzle", "Cyberpunk"],
        },
        {
          title: "Astro Drift",
          description:
            "Carreras anti-gravedad en pistas procedurales donde el drift es tu mejor arma y la física es tu peor enemiga.",
          role: "Systems Designer - Diseñé el modelo de física del vehículo, el sistema de boost por drift y el generador de pistas procedurales.",
          challenge:
            "Lograr que el drift se sienta satisfactorio pero controlable. Iteramos durante semanas ajustando curvas de fricción y respuesta de controles.",
          genre: ["Racing", "Arcade"],
        },
        {
          title: "Whispers in the Dark",
          description:
            "Una experiencia de horror psicológico donde tus decisiones alteran la realidad y los susurros guían tu destino.",
          role: "Narrative Designer - Escribí el guion ramificado, diseñé el sistema de consecuencias y las mecánicas de sanidad mental.",
          challenge:
            "Mantener coherencia narrativa en 12 finales diferentes. Usamos un sistema de variables persistentes que afectan diálogos y eventos futuros.",
          genre: ["Horror", "Narrativo"],
        },
        {
          title: "Forge Master",
          description:
            "Administra tu herrería medieval, crea armas legendarias y satisface pedidos de héroes que buscan equipamiento.",
          role: "Solo Developer - Diseñé e implementé todas las mecánicas: sistema de crafting, economía, reputación y pedidos procedurales.",
          challenge:
            "Crear un loop satisfactorio de corto y largo plazo. El sistema de recetas descubribles mantiene la curiosidad mientras la reputación da objetivos a largo plazo.",
          genre: ["Simulación", "Management"],
        },
      ],
    },
    // Projects
    projects: {
      title: "Proyectos",
      subtitle:
        "Ideas, conceptos y proyectos que nunca vieron la luz... o aún no. Descubre lo que está por venir, las ideas a futuro y aquellos barcos que se hundieron para siempre.",
      searchPlaceholder: "Buscar proyectos...",
      filterAll: "Todos",
      filterPlatform: "Plataforma",
      filterGenre: "Género",
      filterTags: "Etiquetas",
      moreFilters: "Más filtros",
      clearFilters: "Limpiar filtros",
      projectsFound: "proyectos encontrados",
      seeDetails: "ver_detalles",
      noResults: "No se encontraron proyectos con esos criterios.",
      downloadResources: "Recursos disponibles",
    },
    // ExperienceTimeline
    experience: {
      title: "Experiencia",
      subtitle:
        "Mi trayectoria en el desarrollo de videojuegos. Cada punto en esta línea representa un capítulo de aprendizaje y crecimiento.",
      typeWork: "Trabajo",
      typeProject: "Proyecto",
      typeMilestone: "Hito",
      achievements: "// Logros destacados",
      readMore: "Leer Lore Completo",
      selectPrompt: "Selecciona un punto en la línea de tiempo para ver los detalles",
      items: [
        {
          title: "Technical Game Designer",
          company: "Indie Studio Collab",
          overview:
            "Lideré el diseño técnico de un roguelike cooperativo, desde la conceptualización hasta el lanzamiento en Early Access.",
          highlights: [
            "Diseñé el sistema de progresión y metaprogresión",
            "Implementé herramientas de debug para el equipo de QA",
            "Coordiné con programadores para optimizar sistemas core",
          ],
        },
        {
          title: "Game Designer & Programmer",
          company: "Game Jam Team",
          overview:
            "Participé en múltiples game jams, obteniendo Top 10 en Ludum Dare 54 con un puzzle game sobre limitaciones espaciales.",
          highlights: [
            "Desarrollé 4 juegos completos en 48-72 horas cada uno",
            "Iteré mecánicas basándome en feedback de jugadores",
            "Aprendí a priorizar features bajo presión de tiempo",
          ],
        },
        {
          title: "Junior Game Designer",
          company: "Mobile Games Studio",
          overview:
            "Mi primer rol profesional en la industria. Trabajé en el diseño de niveles y economía de un puzzle mobile con 500K+ descargas.",
          highlights: [
            "Diseñé 50+ niveles con curva de dificultad progresiva",
            "Analicé métricas de retención para optimizar el onboarding",
            "Colaboré con el equipo de monetización en eventos especiales",
          ],
        },
        {
          title: "Primeros Prototipos",
          company: "Proyectos Personales",
          overview:
            "El año donde todo comenzó. Completé mis primeros prototipos jugables y descubrí mi pasión por el diseño técnico.",
          highlights: [
            "Lancé mi primer juego en Itch.io",
            "Aprendí GDScript y los fundamentos de Godot",
            "Empecé a documentar mis procesos de diseño",
          ],
        },
        {
          title: "Técnico en Computación",
          company: "Escuela Técnica",
          overview:
            "Finalicé mis estudios técnicos con orientación en programación, sentando las bases para mi carrera en desarrollo de videojuegos.",
          highlights: [
            "Aprendí fundamentos de programación en C y Python",
            "Desarrollé proyectos de software como trabajo final",
            "Descubrí el mundo del game development",
          ],
        },
      ],
    },
    // SkillTree
    skills: {
      title: "Estudios y Habilidades",
      subtitle:
        "Mi árbol de habilidades como Game Designer. Cada nodo representa una especialización con sus certificaciones y conocimientos asociados.",
      level: "Nivel:",
      certs: "// Certificaciones y Conocimientos",
      hoverPrompt: "Pasa el cursor sobre un nodo para ver sus detalles",
      nodes: {
        foundation: {
          name: "Técnico en Computación",
          certifications: [
            "Técnico en Computación - Escuela Técnica (2020)",
            "Fundamentos de Programación",
            "Redes y Sistemas Operativos",
          ],
        },
        programming: {
          name: "Programación",
          certifications: [
            "C# para Unity - Udemy",
            "GDScript Avanzado - Autodidacta",
            "Patrones de Diseño para Juegos",
            "Algoritmos y Estructuras de Datos",
          ],
        },
        "level-design": {
          name: "Diseño de Niveles",
          certifications: [
            "Level Design for Games - Coursera",
            "Environmental Storytelling",
            "Diseño de Puzzles y Encuentros",
            "Métricas y Progresión",
          ],
        },
        production: {
          name: "Producción",
          certifications: [
            "Scrum Fundamentals - ScrumStudy",
            "Gestión de Proyectos Ágiles",
            "Documentación de Juegos (GDD)",
            "Liderazgo de Equipos Pequeños",
          ],
        },
      },
    },
    // ToolInventory
    tools: {
      title: "Inventario de Herramientas",
      subtitle:
        "Mi stack tecnológico para desarrollo de videojuegos.",
      mastery: "Dominio",
      categories: {
        Motor: "Motor",
        Lenguaje: "Lenguaje",
        Versionado: "Versionado",
        Gestión: "Gestión",
        Narrativa: "Narrativa",
        "UI/UX": "UI/UX",
        "2D": "2D",
        Datos: "Datos",
      },
    },
    // ContactQuest
    contact: {
      title: "Tablero de Misiones",
      subtitle:
        "¿Tienes una misión para mí? Selecciona el tipo de colaboración que buscas y comencemos la aventura juntos.",
      accept: "Aceptar Misión",
      reward: "Recompensa:",
      findMe: "// O encuéntrame en:",
      completeForm: "Completa el formulario para iniciar esta misión",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      email: "Email",
      emailPlaceholder: "tu@email.com",
      cancel: "Cancelar",
      send: "Enviar",
      describeProject: "Describe tu proyecto",
      describePosition: "Cuéntame sobre la posición",
      linkGame: "Link a tu juego + contexto",
      messagePlaceholder: "Escribe tu mensaje aquí...",
      quests: [
        {
          title: "Misión: Feedback de Juego",
          description: "¿Quieres que analice tu juego? Ofrezco feedback constructivo basado en mi experiencia.",
          reward: "Análisis detallado + Sugerencias",
          difficulty: "Fácil",
        },
        {
          title: "Misión: Contratación Freelance",
          description: "¿Necesitas un Game Designer para tu proyecto? Contáctame para discutir cómo puedo ayudarte.",
          reward: "Diseño de juegos profesional",
          difficulty: "Normal",
        },
        {
          title: "Misión: Entrevista Laboral",
          description: "Estoy buscando oportunidades de tiempo completo. Si tu estudio está contratando, hablemos.",
          reward: "Un diseñador dedicado",
          difficulty: "Legendario",
        },
      ],
    },
    // Blog
    blog: {
      heroSubtitle: "// Reflexiones, tutoriales y post-mortems sobre desarrollo de videojuegos",
      heroDescription:
        "Comparto mi experiencia como Technical Game Designer: desde los desafíos técnicos de implementar sistemas complejos hasta las lecciones aprendidas en cada proyecto.",
      articles: "artículos",
      updatedWeekly: "Actualizado",
      weekly: "semanalmente",
      sectionTitle: "Devlog y Blog",
      sectionSubtitle:
        "Artículos sobre desarrollo de juegos, post-mortems de proyectos y reflexiones sobre la industria del gaming.",
      searchPlaceholder: "Buscar artículos...",
      allCategories: "Todos",
      readMore: "Leer artículo",
      readMoreShort: "Leer más",
      minRead: "min de lectura",
      noResults: "No se encontraron artículos con esos criterios.",
      featured: "Destacado",
      search: "Buscar",
      categories: "Categorías",
      popularTags: "Tags Populares",
      newsletter: "Newsletter",
      newsletterDesc: "Recibe nuevos artículos directamente en tu correo.",
      subscribed: "Gracias por suscribirte.",
      subscribe: "Suscribirse",
      share: "Compartir",
      sharePost: "Compartir este artículo",
      shareOn: "Compartir en",
      scrollToTop: "Volver arriba",
      copyLink: "Copiar enlace",
      savePost: "Guardar artículo",
      copied: "Copiado",
      backToBlog: "Volver al Blog",
      relatedPosts: "Artículos relacionados",
      homeCategories: {
        "Actualizaciones": "Actualizaciones",
        "Post-Mortems": "Post-Mortems",
        "Opinión de Industria": "Opinión de Industria",
      },
      blogCategories: {
        "Post-Mortems": "Post-Mortems",
        "Tutoriales": "Tutoriales",
        "Opinión": "Opinión",
        "Devlogs": "Devlogs",
        "Noticias": "Noticias",
      },
    },
    // Footer
    footer: {
      madeBy: "Diseñado y desarrollado por",
    },
    // Pages meta
    gamesPage: {
      title: "Mis Videojuegos",
      subtitle: "Una galería completa de mis proyectos como Game Designer y desarrollador.",
    },
    projectsPage: {
      title: "Proyectos",
      subtitle: "Ideas, conceptos y proyectos que nunca vieron la luz... o aún no.",
    },
  },

  en: {
    nav: {
      home: "Home",
      about: "About Me",
      games: "My Games",
      projects: "Projects",
      experience: "Experience",
      skills: "Education",
      blog: "Blog",
      contact: "Contact",
    },
    status: {
      objective: "Objective:",
      objectiveValue: "Gamedev Job Hunt",
      location: "Location:",
      locationValue: "Buenos Aires, AR",
    },
    hero: {
      badge: "system_started",
      title1: "Welcome to",
      title2: "Command Center",
      title3: "of Mathías Andino",
      subtitle: "Technical Game Designer & Future Creative Director",
      class: "Class: Game Designer",
      spec: "Specialization: Technical",
      region: "Region: Argentina",
      ctaGames: "My Games",
      ctaProjects: "Projects",
      ctaContact: "Contact Me",
      scrollDown: "scroll down",
    },
    // AboutMe
    about: {
      label: "ABOUT ME",
      titlePart1: "Creating interactive digital worlds since",
      titleYear: "2025",
      paragraph1: "I'm a Technical Game Designer from Buenos Aires, Argentina, with 1 year of experience, currently finishing my degree in Video Game Production (UNPAZ). My focus is on creating gaming experiences that feel incredible — game feel is at the heart of everything I design.",
      paragraph2: "I specialize in gameplay mechanics design, progression systems, and interactive narrative. I use Godot as my main development engine and participated in the Global Game Jam, where I discovered my passion for creating under creative pressure.",
      paragraph3: "With 3 video games developed and a first commercial release planned for mid-2027, I'm building my path towards becoming a Creative Director. Every project is an opportunity to perfect the art of making games feel satisfying.",
      stat1Title: "1 year",
      stat1Desc: "Experience in video game development",
      stat2Title: "3 games",
      stat2Desc: "Projects developed and published",
      stat3Title: "Game Feel",
      stat3Desc: "Focus on gameplay sensations",
      stat4Title: "Global Game Jam",
      stat4Desc: "Participation in international jams",
    },
    featured: {
      title: "Featured Games",
      seeAll: "See all games",
      filterAll: "All",
      filterComplete: "Complete Game",
      filterJam: "Game Jam",
      filterWip: "In Development",
      games: [
        {
          title: "Hollow Depths",
          description: "A dark metroidvania with fluid combat mechanics and non-linear exploration.",
          genre: ["Metroidvania", "Action"],
          type: "complete",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 0,
        },
        {
          title: "Pixel Survivor",
          description: "Survive infinite waves in this pixelated roguelike. Made during the Global Game Jam.",
          genre: ["Roguelike", "Survival"],
          type: "jam",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 1,
        },
        {
          title: "Neon Circuit",
          description: "Solve circuits in a dystopian cyberpunk world. Currently in active development.",
          genre: ["Puzzle", "Cyberpunk"],
          type: "wip",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 2,
        },
        {
          title: "Astro Drift",
          description: "Anti-gravity racing on procedural tracks where drifting is your best weapon.",
          genre: ["Racing", "Arcade"],
          type: "complete",
          itchUrl: "https://ninetygames.itch.io/",
          gameIndex: 3,
        },
      ],
    },
    games: {
      title: "My Games",
      subtitle:
        "A collection of projects I participated in as designer and/or programmer. Each one represents a unique challenge and valuable learnings.",
      seeDetails: "view_details",
      role: "My Role",
      challenge: "The Technical Challenge",
      viewGDD: "View GDD",
      playDemo: "Play Demo",
      items: [
        {
          title: "Hollow Depths",
          description:
            "A dark metroidvania with fluid combat mechanics and non-linear exploration in the depths of a forgotten civilization.",
          role: "Technical Game Designer - Led combat systems design, player progression, and level architecture. Implemented the unlockable skills system and interconnected map.",
          challenge:
            "The biggest challenge was balancing the difficulty curve while maintaining the sense of discovery. We implemented a telemetry system to adjust checkpoints and rewards based on playtest data.",
          genre: ["Metroidvania", "Action"],
        },
        {
          title: "Pixel Survivor",
          description:
            "Survive infinite enemy waves in this pixelated roguelike with procedural builds and skill synergies.",
          role: "Lead Designer - Designed the roguelike progression system, skill tree, and survival mechanics. Created over 50 items with unique synergistic effects.",
          challenge:
            "Creating meaningful variety each run was critical. We developed a dynamic weight system that adjusts item probability based on the player's current build.",
          genre: ["Roguelike", "Survival"],
        },
        {
          title: "Neon Circuit",
          description:
            "Solve logic circuits in a dystopian cyberpunk world where each puzzle reveals fragments of a corporate conspiracy.",
          role: "Game Designer & Programmer - Designed circuit puzzles and narrative progression. Programmed the circuit validation system and UI animations.",
          challenge:
            "Balancing puzzle difficulty for casual and hardcore users. We implemented a progressive hint system and multiple valid solutions per level.",
          genre: ["Puzzle", "Cyberpunk"],
        },
        {
          title: "Astro Drift",
          description:
            "Anti-gravity racing on procedural tracks where drifting is your best weapon and physics is your worst enemy.",
          role: "Systems Designer - Designed the vehicle physics model, drift boost system, and procedural track generator.",
          challenge:
            "Making the drift feel satisfying yet controllable. We iterated for weeks tweaking friction curves and control response.",
          genre: ["Racing", "Arcade"],
        },
        {
          title: "Whispers in the Dark",
          description:
            "A psychological horror experience where your decisions alter reality and whispers guide your fate.",
          role: "Narrative Designer - Wrote the branching script, designed the consequence system, and mental sanity mechanics.",
          challenge:
            "Maintaining narrative coherence across 12 different endings. We used a persistent variable system affecting future dialogues and events.",
          genre: ["Horror", "Narrative"],
        },
        {
          title: "Forge Master",
          description:
            "Manage your medieval smithy, craft legendary weapons, and fulfill orders from heroes seeking equipment.",
          role: "Solo Developer - Designed and implemented all mechanics: crafting system, economy, reputation, and procedural orders.",
          challenge:
            "Creating a satisfying short and long-term loop. The discoverable recipe system keeps curiosity alive while reputation provides long-term goals.",
          genre: ["Simulation", "Management"],
        },
      ],
    },
    projects: {
      title: "Projects",
      subtitle:
        "Ideas, concepts, and projects that never saw the light... or not yet. Discover what is coming, future ideas, and those ships that sank forever.",
      searchPlaceholder: "Search projects...",
      filterAll: "All",
      filterPlatform: "Platform",
      filterGenre: "Genre",
      filterTags: "Tags",
      moreFilters: "More filters",
      clearFilters: "Clear filters",
      projectsFound: "projects found",
      seeDetails: "view_details",
      noResults: "No projects found matching those criteria.",
      downloadResources: "Available resources",
    },
    experience: {
      title: "Experience",
      subtitle:
        "My journey in video game development. Each point on this timeline represents a chapter of learning and growth.",
      typeWork: "Work",
      typeProject: "Project",
      typeMilestone: "Milestone",
      achievements: "// Notable achievements",
      readMore: "Read Full Lore",
      selectPrompt: "Select a point on the timeline to view details",
      items: [
        {
          title: "Technical Game Designer",
          company: "Indie Studio Collab",
          overview:
            "Led the technical design of a cooperative roguelike, from conceptualization to Early Access launch.",
          highlights: [
            "Designed the progression and meta-progression system",
            "Implemented debug tools for the QA team",
            "Coordinated with programmers to optimize core systems",
          ],
        },
        {
          title: "Game Designer & Programmer",
          company: "Game Jam Team",
          overview:
            "Participated in multiple game jams, achieving Top 10 at Ludum Dare 54 with a puzzle game about spatial limitations.",
          highlights: [
            "Developed 4 complete games in 48-72 hours each",
            "Iterated mechanics based on player feedback",
            "Learned to prioritize features under time pressure",
          ],
        },
        {
          title: "Junior Game Designer",
          company: "Mobile Games Studio",
          overview:
            "My first professional role in the industry. Worked on level design and economy for a mobile puzzle game with 500K+ downloads.",
          highlights: [
            "Designed 50+ levels with progressive difficulty curve",
            "Analyzed retention metrics to optimize onboarding",
            "Collaborated with the monetization team on special events",
          ],
        },
        {
          title: "First Prototypes",
          company: "Personal Projects",
          overview:
            "The year where it all started. Completed my first playable prototypes and discovered my passion for technical design.",
          highlights: [
            "Launched my first game on Itch.io",
            "Learned GDScript and the fundamentals of Godot",
            "Started documenting my design processes",
          ],
        },
        {
          title: "Computer Technician",
          company: "Technical School",
          overview:
            "Completed my technical studies with a programming focus, laying the foundation for my career in game development.",
          highlights: [
            "Learned programming fundamentals in C and Python",
            "Developed software projects as a final project",
            "Discovered the world of game development",
          ],
        },
      ],
    },
    skills: {
      title: "Education & Skills",
      subtitle:
        "My skill tree as a Game Designer. Each node represents a specialization with its certifications and associated knowledge.",
      level: "Level:",
      certs: "// Certifications & Knowledge",
      hoverPrompt: "Hover over a node to see its details",
      nodes: {
        foundation: {
          name: "Computer Technician",
          certifications: [
            "Computer Technician - Technical School (2020)",
            "Programming Fundamentals",
            "Networks and Operating Systems",
          ],
        },
        programming: {
          name: "Programming",
          certifications: [
            "C# for Unity - Udemy",
            "Advanced GDScript - Self-taught",
            "Game Design Patterns",
            "Algorithms and Data Structures",
          ],
        },
        "level-design": {
          name: "Level Design",
          certifications: [
            "Level Design for Games - Coursera",
            "Environmental Storytelling",
            "Puzzle and Encounter Design",
            "Metrics and Progression",
          ],
        },
        production: {
          name: "Production",
          certifications: [
            "Scrum Fundamentals - ScrumStudy",
            "Agile Project Management",
            "Game Documentation (GDD)",
            "Small Team Leadership",
          ],
        },
      },
    },
    tools: {
      title: "Tool Inventory",
      subtitle:
        "My tech stack for game development. Each tool is a weapon in my Game Designer arsenal.",
      mastery: "Mastery",
  categories: {
    Motor: "Engine",
  Lenguaje: "Language",
  Versionado: "Version Control",
  Gestión: "Management",
  Narrativa: "Narrative",
  "UI/UX": "UI/UX",
  "2D": "2D",
  Datos: "Data",
      },
    },
    contact: {
      title: "Mission Board",
      subtitle:
        "Do you have a mission for me? Select the type of collaboration you are looking for and let's start the adventure together.",
      accept: "Accept Mission",
      reward: "Reward:",
      findMe: "// Or find me at:",
      completeForm: "Complete the form to start this mission",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@email.com",
      cancel: "Cancel",
      send: "Send",
      describeProject: "Describe your project",
      describePosition: "Tell me about the position",
      linkGame: "Link to your game + context",
      messagePlaceholder: "Write your message here...",
      quests: [
        {
          title: "Mission: Game Feedback",
          description: "Do you want me to analyze your game? I offer constructive feedback based on my experience.",
          reward: "Detailed analysis + Suggestions",
          difficulty: "Easy",
        },
        {
          title: "Mission: Freelance Hire",
          description: "Do you need a Game Designer for your project? Contact me to discuss how I can help.",
          reward: "Professional game design",
          difficulty: "Normal",
        },
        {
          title: "Mission: Job Interview",
          description: "I am looking for full-time opportunities. If your studio is hiring, let's talk.",
          reward: "A dedicated designer",
          difficulty: "Legendary",
        },
      ],
    },
    blog: {
      heroSubtitle: "// Reflections, tutorials and post-mortems on game development",
      heroDescription:
        "I share my experience as a Technical Game Designer: from the technical challenges of implementing complex systems to the lessons learned in each project.",
      articles: "articles",
      updatedWeekly: "Updated",
      weekly: "weekly",
      sectionTitle: "Devlog & Blog",
      sectionSubtitle:
        "Articles about game development, project post-mortems, and reflections on the gaming industry.",
      searchPlaceholder: "Search articles...",
      allCategories: "All",
      readMore: "Read article",
      readMoreShort: "Read more",
      minRead: "min read",
      noResults: "No articles found matching those criteria.",
      featured: "Featured",
      search: "Search",
      categories: "Categories",
      popularTags: "Popular Tags",
      newsletter: "Newsletter",
      newsletterDesc: "Receive new articles directly to your inbox.",
      subscribed: "Thank you for subscribing.",
      subscribe: "Subscribe",
      share: "Share",
      sharePost: "Share this article",
      shareOn: "Share on",
      scrollToTop: "Back to top",
      copyLink: "Copy link",
      savePost: "Save article",
      copied: "Copied",
      backToBlog: "Back to Blog",
      relatedPosts: "Related articles",
      homeCategories: {
        "Actualizaciones": "Updates",
        "Post-Mortems": "Post-Mortems",
        "Opinión de Industria": "Industry Opinion",
      },
      blogCategories: {
        "Post-Mortems": "Post-Mortems",
        "Tutoriales": "Tutorials",
        "Opinión": "Opinion",
        "Devlogs": "Devlogs",
        "Noticias": "News",
      },
    },
    footer: {
      madeBy: "Designed and developed by",
    },
    gamesPage: {
      title: "My Games",
      subtitle: "A complete gallery of my projects as a Game Designer and developer.",
    },
    projectsPage: {
      title: "Projects",
      subtitle: "Ideas, concepts and projects that never saw the light... or not yet.",
    },
  },
} as const

type Translations = typeof translations.es

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es")

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null
    if (stored === "es" || stored === "en") setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("lang", l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
