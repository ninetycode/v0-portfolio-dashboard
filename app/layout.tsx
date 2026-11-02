import type { Metadata } from 'next'
import { Lora, Fira_Code, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LangProvider } from '@/lib/i18n'
import { SiteContentProvider } from '@/lib/site-content/context'
import { readSiteContent } from '@/lib/site-content/store'
import { CursorProvider } from '@/lib/cursor-context'
import { AudioProvider } from '@/lib/audio-context'
import { AdminProvider } from '@/lib/admin-context'
import { ThemeProvider } from '@/components/theme-provider'
import { CustomCursor } from '@/components/custom-cursor'
import { TerminalEasterEgg } from '@/components/terminal-easter-egg'
import { AdminEditShortcut } from '@/components/admin-content-bar'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ScrollReveal } from '@/components/scroll-reveal'
import { siteBaseUrl } from '@/lib/site-url'
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
  metadataBase: new URL(siteBaseUrl()),
  title: 'Mathías Andino | Game Narrative Designer Junior',
  description: 'Portfolio de Mathías Andino, Game Narrative Designer Junior de Buenos Aires. Diseño narrativo, sistemas de juego y desarrollo con Godot.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteContent = await readSiteContent()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${lora.variable} ${firaCode.variable} ${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteContentProvider content={siteContent}>
            <LangProvider>
              <AdminProvider>
                <CursorProvider>
                  <AudioProvider>
                    <CustomCursor />
                    <ScrollReveal />
                    {children}
                    <ScrollToTop />
                    <AdminEditShortcut />
                    <TerminalEasterEgg />
                  </AudioProvider>
                </CursorProvider>
              </AdminProvider>
            </LangProvider>
          </SiteContentProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
