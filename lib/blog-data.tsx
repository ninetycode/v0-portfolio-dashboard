export interface Author {
  name: string
  avatar: string
  role: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  category: string
  tags: string[]
  author: Author
  featured: boolean
  color: string
}

export const categories = [
  "Post-Mortems",
  "Tutoriales",
  "Opinión",
  "Devlogs",
  "Noticias",
] as const

export const popularTags = [
  "Unity",
  "Godot",
  "Game Design",
  "Programación",
  "Level Design",
  "Narrativa",
  "Pixel Art",
  "Roguelike",
  "Indie",
]

export const blogPosts: BlogPost[] = [
  {
    id: "roguelike-postmortem",
    slug: "roguelike-cooperativo-postmortem",
    title: "Post-Mortem: Desarrollando un Roguelike Cooperativo",
    excerpt: "Las lecciones aprendidas tras 18 meses desarrollando nuestro primer roguelike con netcode. Desde el diseño inicial hasta el Early Access.",
    content: `
# El Inicio del Proyecto

Hace 18 meses comenzamos con una idea simple: **¿qué pasaría si combináramos la tensión de un roguelike con la diversión del cooperativo local?** Lo que no sabíamos era la cantidad de desafíos técnicos y de diseño que enfrentaríamos.

## El Concepto Original

La premisa era clara: un roguelike top-down donde hasta 4 jugadores pudieran explorar dungeons generados proceduralmente, compartiendo recursos y enfrentando oleadas de enemigos cada vez más difíciles.

### Decisiones Técnicas Clave

Elegimos **Godot 4** por su sistema de nodos flexible y su netcode integrado. Las primeras semanas fueron prometedoras:

\`\`\`gdscript
# Sistema base de sincronización
func _on_player_action(action: Dictionary):
    if multiplayer.is_server():
        validate_and_broadcast(action)
    else:
        rpc_id(1, "request_action", action)
\`\`\`

## Los Desafíos del Netcode

El mayor obstáculo fue sincronizar la generación procedural. Cada cliente necesitaba generar **exactamente** el mismo dungeon usando la misma seed.

### Solución: Determinismo Total

1. Todas las seeds se generan en el servidor
2. Los clientes reciben la seed antes de generar
3. Validación de checksum cada 10 rooms

## Lecciones Aprendidas

- **Prototipa el netcode primero**: No lo dejes para el final
- **El rollback es tu amigo**: Implementamos rollback para inputs de combate
- **Testea con latencia artificial**: 200ms de ping reveló muchos bugs

## Resultados

Después de 18 meses:
- **500+ wishlists** en Steam
- **92% de reviews positivas** en el demo
- Early Access programado para Q2 2025

El proyecto nos enseñó que la comunicación entre equipo es tan importante como la comunicación entre cliente y servidor.
    `,
    date: "15 de noviembre de 2024",
    readTime: "12 min",
    category: "Post-Mortems",
    tags: ["Godot", "Roguelike", "Netcode", "Cooperativo", "Indie"],
    author: {
      name: "Mathías Andino",
      avatar: "/profile-avatar.jpg",
      role: "Technical Game Designer",
    },
    featured: true,
    color: "from-primary/20 to-accent/20",
  },
  {
    id: "game-feel-sistemas",
    slug: "game-feel-mas-que-particulas",
    title: "Game Feel: Más que Partículas y Screen Shake",
    excerpt: "Un análisis profundo de lo que hace que un juego se sienta bien, con ejemplos prácticos de implementación en Godot y Unity.",
    content: `
# ¿Qué es el Game Feel?

El **game feel** (o "juice") es esa sensación intangible que hace que un juego se sienta *bien*. No es solo agregar partículas y screen shake, es una combinación cuidadosa de feedback visual, auditivo y táctil.

## Los Pilares del Game Feel

### 1. Feedback Inmediato

Cada acción del jugador debe tener una respuesta instantánea:

\`\`\`csharp
// Unity - Feedback de ataque
IEnumerator AttackFeedback()
{
    // Freeze frame para impacto
    Time.timeScale = 0.1f;
    yield return new WaitForSecondsRealtime(0.05f);
    Time.timeScale = 1f;
    
    // Screen shake
    CameraShake.Instance.Shake(0.15f, 0.1f);
    
    // Partículas + sonido
    impactVFX.Play();
    AudioManager.Play("hit_impact");
}
\`\`\`

### 2. Anticipación y Seguimiento

- **Anticipación**: Squash antes de saltar
- **Acción**: El salto en sí
- **Seguimiento**: Stretch en el aire, squash al aterrizar

### 3. Peso y Momentum

Los objetos deben sentirse con peso real. Usa curvas de animación no lineales:

- Ease-out para inicios rápidos
- Ease-in para finales suaves
- Bounce para impactos

## Implementación Práctica

### Sistema de Hitstop

\`\`\`gdscript
# Godot - Hitstop manager
var hitstop_timer := 0.0

func apply_hitstop(duration: float):
    hitstop_timer = duration
    Engine.time_scale = 0.0

func _process(delta):
    if hitstop_timer > 0:
        hitstop_timer -= delta
        if hitstop_timer <= 0:
            Engine.time_scale = 1.0
\`\`\`

## Errores Comunes

1. **Demasiado shake**: Distrae en vez de enfatizar
2. **Feedback inconsistente**: Mismas acciones deben sentirse igual
3. **Ignorar el audio**: El sonido es 50% del game feel

## Conclusión

El game feel no se agrega al final, se diseña desde el principio. Cada mecánica debe preguntarse: *¿cómo se siente esto?*
    `,
    date: "28 de octubre de 2024",
    readTime: "8 min",
    category: "Tutoriales",
    tags: ["Game Design", "Unity", "Godot", "Programación"],
    author: {
      name: "Mathías Andino",
      avatar: "/profile-avatar.jpg",
      role: "Technical Game Designer",
    },
    featured: true,
    color: "from-chart-2/20 to-primary/20",
  },
  {
    id: "inventario-modular",
    slug: "sistema-inventario-modular",
    title: "Devlog: Sistema de Inventario Modular",
    excerpt: "Cómo diseñé e implementé un sistema de inventario flexible que se adapta a diferentes géneros de juegos.",
    content: `
# El Problema

Cada proyecto nuevo requería un sistema de inventario diferente. RPGs necesitan slots con peso, survival games necesitan stacking, y los shooters necesitan quick-slots. **¿Cómo crear un sistema que sirva para todos?**

## Arquitectura Base

La clave fue separar las responsabilidades:

\`\`\`csharp
// Interfaces modulares
public interface IInventorySlot
{
    IItem Item { get; }
    int Quantity { get; }
    bool CanAccept(IItem item);
}

public interface IInventoryContainer
{
    IEnumerable<IInventorySlot> Slots { get; }
    bool TryAdd(IItem item, int quantity);
    bool TryRemove(IItem item, int quantity);
}
\`\`\`

## Componentes del Sistema

### 1. Item Data (ScriptableObject)

\`\`\`csharp
[CreateAssetMenu(menuName = "Inventory/Item")]
public class ItemData : ScriptableObject
{
    public string id;
    public string displayName;
    public Sprite icon;
    public int maxStack = 1;
    public float weight = 0f;
    public ItemType type;
    public List<ItemTag> tags;
}
\`\`\`

### 2. Slot Behaviors

Los slots pueden tener diferentes comportamientos:

- **BasicSlot**: Acepta cualquier item
- **TypedSlot**: Solo acepta tipos específicos
- **EquipmentSlot**: Valida estadísticas requeridas

### 3. Container Policies

\`\`\`csharp
public class WeightBasedContainer : InventoryContainer
{
    public float maxWeight;
    public float currentWeight;
    
    public override bool CanAdd(IItem item, int qty)
    {
        float addedWeight = item.Data.weight * qty;
        return currentWeight + addedWeight <= maxWeight;
    }
}
\`\`\`

## UI Drag & Drop

El sistema de UI se conecta mediante eventos:

1. **OnBeginDrag**: Crea preview visual
2. **OnDrag**: Sigue el cursor
3. **OnDrop**: Valida y ejecuta transferencia
4. **OnEndDrag**: Limpia o revierte

## Resultados

Este sistema ahora lo uso en 3 proyectos diferentes:
- **RPG**: Inventario con peso + equipo
- **Survival**: Stacking + crafting
- **Roguelike**: Quick-slots + power-ups

La inversión inicial de tiempo se recuperó en el segundo proyecto.
    `,
    date: "12 de octubre de 2024",
    readTime: "6 min",
    category: "Devlogs",
    tags: ["Unity", "Programación", "Game Design", "Sistemas"],
    author: {
      name: "Mathías Andino",
      avatar: "/profile-avatar.jpg",
      role: "Technical Game Designer",
    },
    featured: false,
    color: "from-chart-3/20 to-chart-4/20",
  },
  {
    id: "gdd-documento-vivo",
    slug: "gdd-documento-vivo",
    title: "El GDD como Documento Vivo",
    excerpt: "Por qué tu Game Design Document debería evolucionar con el proyecto y cómo estructurarlo para facilitar la iteración.",
    content: `
# El Mito del GDD Perfecto

Muchos diseñadores pasan semanas creando un GDD extenso antes de escribir una línea de código. **Este enfoque está obsoleto.**

## El Problema con GDDs Tradicionales

1. Se vuelven obsoletos rápidamente
2. Nadie los lee completos
3. No reflejan la realidad del desarrollo
4. Crean resistencia al cambio

## GDD como Documento Vivo

Un GDD moderno debe ser:

- **Iterativo**: Se actualiza con cada sprint
- **Modular**: Secciones independientes
- **Accesible**: Fácil de buscar y navegar
- **Versionado**: Historial de cambios claro

### Estructura Recomendada

\`\`\`markdown
# [Nombre del Juego] - GDD v2.4

## 1. Vision Statement (1 párrafo)
## 2. Core Pillars (3-5 puntos)
## 3. Target Audience
## 4. Core Loop (diagrama)
## 5. Systems (links a docs específicos)
## 6. Content Scope
## 7. Technical Requirements
## 8. Milestones
\`\`\`

## Herramientas Recomendadas

- **Notion**: Flexible, colaborativo
- **Confluence**: Para equipos más grandes
- **GitHub Wiki**: Si ya usas Git
- **Obsidian**: Para linking de conceptos

## El Flujo de Actualización

1. **Diseño inicial**: Hipótesis
2. **Prototipo**: Prueba la hipótesis
3. **Actualizar GDD**: Documenta lo aprendido
4. **Repetir**

## Conclusión

Tu GDD no es un contrato, es un mapa que se actualiza mientras exploras el territorio de tu juego.
    `,
    date: "20 de septiembre de 2024",
    readTime: "10 min",
    category: "Opinión",
    tags: ["Game Design", "Documentación", "Producción"],
    author: {
      name: "Mathías Andino",
      avatar: "/profile-avatar.jpg",
      role: "Technical Game Designer",
    },
    featured: false,
    color: "from-chart-4/20 to-chart-5/20",
  },
  {
    id: "godot-4-novedades",
    slug: "godot-4-3-novedades-gamedev",
    title: "Godot 4.3: Lo que Significa para Desarrolladores Indie",
    excerpt: "Un análisis de las nuevas features de Godot 4.3 y cómo aprovecharlas en tus proyectos indie.",
    content: `
# Godot 4.3 ya está aquí

La última versión de Godot trae mejoras significativas que impactan directamente el workflow de desarrolladores indie. Veamos las más importantes.

## Mejoras en 2D

### Tiles Isométricos Mejorados

El sistema de TileMap ahora soporta mejor las perspectivas isométricas:

- Sorting automático por Y
- Preview en editor más preciso
- Mejor performance con muchos tiles

### Nuevo Sistema de Partículas 2D

\`\`\`gdscript
# Ahora puedes usar texturas animadas
var particles = GPUParticles2D.new()
particles.texture = animated_spritesheet
particles.sprite_frames = 8  # Nuevo!
\`\`\`

## Mejoras en el Editor

### Scene Tree Dock

- Búsqueda fuzzy mejorada
- Filtros por tipo de nodo
- Drag & drop más intuitivo

### Debugger Mejorado

El profiler ahora muestra:
- Memoria por nodo
- Calls por frame
- Network traffic (para multiplayer)

## Para Desarrolladores Indie

¿Por qué esto importa?

1. **Menor tiempo de iteración**: El editor es más rápido
2. **Mejor debugging**: Encuentras bugs más rápido  
3. **2D first-class**: Ya no se siente como ciudadano de segunda

## Migración desde 4.2

La migración es relativamente suave:

- Backup tu proyecto primero
- Revisa los breaking changes en el changelog
- Testea tu sistema de guardado

## Conclusión

Godot sigue mejorando a un ritmo impresionante. Para proyectos indie, especialmente 2D, es una opción cada vez más sólida.
    `,
    date: "5 de agosto de 2024",
    readTime: "7 min",
    category: "Noticias",
    tags: ["Godot", "Indie", "Noticias", "2D"],
    author: {
      name: "Mathías Andino",
      avatar: "/profile-avatar.jpg",
      role: "Technical Game Designer",
    },
    featured: false,
    color: "from-primary/20 to-chart-3/20",
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, limit)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category)
}

export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase()
  return blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const post of blogPosts) {
    counts[post.category] = (counts[post.category] || 0) + 1
  }
  return counts
}
