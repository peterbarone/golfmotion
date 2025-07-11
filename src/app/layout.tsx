import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'Golf Swing Tempo Trainer',
  description: 'Analyze and improve your golf swing tempo',
}

// Import the client components
import ThemeWrapper from '../components/ThemeWrapper'
import BottomNavigation from '../components/BottomNavigation'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@latest/pose.js"
          defer
        ></script>
      </head>
      <body className={roboto.className}>
        <ThemeWrapper>
          {/* Main content area with padding to accommodate bottom navigation */}
          <div style={{ paddingBottom: '56px' }}>
            {children}
          </div>
          <BottomNavigation />
        </ThemeWrapper>
      </body>
    </html>
  )
}
