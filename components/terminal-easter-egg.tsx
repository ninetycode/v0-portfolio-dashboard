"use client"

import { useState, useRef, useEffect } from "react"
import { Terminal, Minus, X, Maximize2, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "next-themes"
import { useCursor } from "@/lib/cursor-context"
import { useAudio } from "@/lib/audio-context"

interface TerminalLine {
  type: "input" | "output" | "error" | "system"
  content: string
}

const staticCommands: Record<string, string | string[]> = {
  help: [
    "Comandos disponibles:",
    "  help     - Muestra esta ayuda",
    "  about    - Sobre Mathías Andino",
    "  skills   - Lista de habilidades",
    "  contact  - Información de contacto",
    "  games    - Lista de juegos",
    "  glow     - Activa/desactiva el halo de luz del cursor",
    "  play     - Reproduce la banda sonora",
    "  stop     - Detiene la música",
    "  secret   - ???",
    "  clear    - Limpia la terminal",
  ],
  about: [
    "╔══════════════════════════════════════╗",
    "║  MATHÍAS ANDINO                      ║",
    "║  Technical Game Designer             ║",
    "║  Nivel: 27  |  Clase: Designer       ║",
    "║  Ubicación: González Catán, AR       ║",
    "╚══════════════════════════════════════╝",
    "",
    "Apasionado por crear experiencias de juego",
    "memorables a través del diseño técnico.",
  ],
  skills: [
    ">> Diseño de Juegos █████████░ 90%",
    ">> Narrativa █████████░ 85%",
    ">> Programación ████████░░ 80%",
    ">> Diseño de Niveles ████████░░ 80%",
    ">> UX/UI ███████░░░ 70%",
    ">> Producción ██████░░░░ 60%",
    ">> Arte █████░░░░░ 50%",
    ">> Música ████░░░░░░ 35%",
  ],
  contact: [
    "╔═══════════════════════════════════════╗",
    "║  CANALES DE COMUNICACIÓN              ║",
    "╠═══════════════════════════════════════╣",
    "║  LinkedIn: /in/mathias-andino         ║",
    "║  GitHub: @mathias-andino              ║",
    "║  Itch.io: mathias-andino.itch.io      ║",
    "║  Email: contacto@mathias.dev          ║",
    "╚═══════════════════════════════════════╝",
  ],
  games: [
    ">> Hollow Depths [Metroidvania] - PC/Web",
    ">> Pixel Survivor [Roguelike] - PC",
    ">> Neon Circuit [Puzzle] - PC/Mobile",
    ">> Astro Drift [Racing] - PC/Web",
    ">> Whispers in the Dark [Horror] - PC",
    ">> Forge Master [Simulación] - PC/Mobile",
  ],
  secret: [
    "",
    "  ██╗  ██╗ ██████╗ ██╗      █████╗ ",
    "  ██║  ██║██╔═══██╗██║     ██╔══██╗",
    "  ███████║██║   ██║██║     ███████║",
    "  ██╔══██║██║   ██║██║     ██╔══██║",
    "  ██║  ██║╚██████╔╝███████╗██║  ██║",
    "  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝",
    "",
    "  ¡Encontraste el easter egg!",
    "  Gracias por explorar mi portfolio.",
    "  ~ Mathías",
    "",
  ],
  clear: "CLEAR",
}

export function TerminalEasterEgg() {
  const { glowEnabled, toggleGlow } = useCursor()
  const { resolvedTheme } = useTheme()
  const { isPlaying, isMuted, play: playAudio, stop: stopAudio, toggleMute } = useAudio()
  const isDark = resolvedTheme === "dark"
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", content: "akane_terminal v1.0.0" },
    { type: "system", content: "Escribe 'help' para ver los comandos disponibles." },
    { type: "output", content: "" },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleCommand = (input: string) => {
    const trimmedInput = input.trim().toLowerCase()
    const newLines: TerminalLine[] = [
      ...lines,
      { type: "input", content: `$ ${input}` },
    ]

    if (trimmedInput === "") {
      setLines(newLines)
      return
    }

    if (trimmedInput === "clear") {
      setLines([
        { type: "system", content: "akane_terminal v1.0.0" },
        { type: "output", content: "" },
      ])
      return
    }

    if (trimmedInput === "glow") {
      toggleGlow()
      const newState = !glowEnabled
      newLines.push({ 
        type: "system", 
        content: `Halo de luz del cursor: ${newState ? "ACTIVADO" : "DESACTIVADO"}` 
      })
      setLines(newLines)
      return
    }

    if (trimmedInput === "play") {
      if (isPlaying) {
        newLines.push({ 
          type: "system", 
          content: "La música ya está reproduciéndose." 
        })
      } else {
        playAudio()
        newLines.push({ 
          type: "system", 
          content: "Reproduciendo banda sonora..." 
        })
      }
      setLines(newLines)
      return
    }

    if (trimmedInput === "stop") {
      if (isPlaying) {
        stopAudio()
        newLines.push({ 
          type: "system", 
          content: "Música detenida." 
        })
      } else {
        newLines.push({ 
          type: "system", 
          content: "No hay música reproduciéndose." 
        })
      }
      setLines(newLines)
      return
    }

    const response = staticCommands[trimmedInput]
    if (response) {
      if (Array.isArray(response)) {
        response.forEach((line) => {
          newLines.push({ type: "output", content: line })
        })
      } else {
        newLines.push({ type: "output", content: response })
      }
    } else {
      newLines.push({ 
        type: "error", 
        content: `Comando no reconocido: '${trimmedInput}'. Escribe 'help' para ayuda.` 
      })
    }

    setLines(newLines)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(currentInput)
      setCurrentInput("")
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
        aria-label="Abrir terminal"
      >
        <Terminal className="h-4 w-4 text-primary" />
        <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
          akane_terminal ~ $
        </span>
        <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse" />
      </button>
    )
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? "bottom-16 right-4 w-auto" 
          : "bottom-16 right-4 w-full max-w-md sm:max-w-lg"
      }`}
    >
      <div
        className="rounded-lg overflow-hidden border shadow-2xl"
        style={{
          backgroundColor: isDark ? "#1a1b26" : "#f0f4f8",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            backgroundColor: isDark ? "#16161e" : "#e2e8f0",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">
              akane_terminal
            </span>
            {isPlaying && (
              <button
                onClick={toggleMute}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors hover:bg-muted/20"
                style={{
                  color: isDark ? "#7ee787" : "#1d6a35",
                }}
                aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
                <span className="animate-pulse">{"♪"}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted/20 transition-colors"
              aria-label={isMinimized ? "Restaurar" : "Minimizar"}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-destructive/20 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        {!isMinimized && (
          <div 
            ref={terminalRef}
            onClick={() => inputRef.current?.focus()}
            className="h-64 overflow-y-auto p-4 font-mono text-sm cursor-text"
            style={{ backgroundColor: isDark ? "#1a1b26" : "#f0f4f8" }}
          >
            {lines.map((line, index) => (
              <div
                key={index}
                className="leading-relaxed"
                style={{
                  color:
                    line.type === "input"
                      ? isDark ? "#7ee787" : "#1d6a35"
                      : line.type === "error"
                      ? isDark ? "#f47067" : "#b91c1c"
                      : line.type === "system"
                      ? isDark ? "#79c0ff" : "#1d4ed8"
                      : isDark ? "#cdd9e5" : "#1e293b",
                }}
              >
                <pre className="whitespace-pre-wrap">{line.content}</pre>
              </div>
            ))}

            {/* Input Line */}
            <div className="flex items-center gap-2 mt-1">
              <span style={{ color: isDark ? "#7ee787" : "#1d6a35" }}>$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none caret-primary"
                style={{ color: isDark ? "#cdd9e5" : "#1e293b" }}
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
              />
              <span className="w-2 h-4 bg-primary/70 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
