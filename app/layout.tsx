import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Q99FM Poll Tracker',
  description: 'Live vote tracking for the Q99FM poll',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">{children}</body>
    </html>
  )
}
