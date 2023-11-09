import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Order Game',
  description: 'A new incredible and funny game inspired in Wordle. You must order the colors in the same order that the solution. You only have 10 attempts to win. You only know how many colors are correct, but not which ones.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
