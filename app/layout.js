import '@/styles/globals.css'

export const metadata = {
  title: 'K-LIFE | The Magic of Purity',
  description:
    'Korean home care products born from pure nature. K-BUBBLE, K-FRESH, K-CLEASTAR — effective, gentle, and economical.',
  keywords: 'Korean cleaning products, K-BUBBLE, K-FRESH, K-CLEASTAR, eco-friendly, vegan',
  openGraph: {
    title: 'K-LIFE | The Magic of Purity',
    description: 'Born in Korea, perfect for your hands.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
