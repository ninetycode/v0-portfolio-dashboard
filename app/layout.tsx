import type { Metadata } from 'next'
import { Lora, Fira_Code, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LangProvider } from '@/lib/i18n'
import { CursorProvider } from '@/lib/cursor-context'
import { AudioProvider } from '@/lib/audio-context'
import { ThemeProvider } from '@/components/theme-provider'
import { CustomCursor } from '@/components/custom-cursor'
import { TerminalEasterEgg } from '@/components/terminal-easter-egg'
import './globals.css'

const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-lora',
  display: 'swap',
})

const firaCode = Fira_Code({ 
  subsets: ["latin"],
  variable: '--font-fira-code',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mathías Andino | Technical Game Designer',
  description: 'Portfolio de Mathías Andino - Technical Game Designer & Futuro Director Creativo. Diseño de juegos, programación y producción.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${lora.variable} ${firaCode.variable} ${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LangProvider>
            <CursorProvider>
              <AudioProvider>
                <CustomCursor />
                {children}
                <TerminalEasterEgg />
              </AudioProvider>
            </CursorProvider>
          </LangProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
