import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Points Advisor',
  description: 'Find out what you can do with your loyalty points',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
