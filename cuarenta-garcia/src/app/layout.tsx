import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Cuarenta — Familia García',
  description: 'Juego de 40 con juez virtual, temporadas y parejas.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          {children}
        </div>
      </body>
    </html>
  )
}
