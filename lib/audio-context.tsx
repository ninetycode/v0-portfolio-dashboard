"use client"

import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react"

interface AudioContextValue {
  isPlaying: boolean
  isMuted: boolean
  play: () => void
  stop: () => void
  toggleMute: () => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio("/audio/moonlit-vale.ogg")
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [])

  const play = useCallback(() => {
    if (!audioRef.current || isPlaying) return
    audioRef.current.play().catch(() => {})
    setIsPlaying(true)
  }, [isPlaying])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }, [])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
    setIsMuted((prev) => !prev)
  }, [])

  return (
    <AudioCtx.Provider value={{ isPlaying, isMuted, play, stop, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error("useAudio must be used within AudioProvider")
  return ctx
}
