import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Ensures text remains visible during font loading
})

export const metadata: Metadata = {
  title: 'シャドーイング英語学習アプリ',
  description: 'シャドーイングを中心とした効率的な英語学習ツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} min-h-screen flex flex-col items-center justify-center`}>
        <main className="w-full max-w-md mx-auto overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
