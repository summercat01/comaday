import type { Metadata } from 'next'
import '../components/App.css'

export const metadata: Metadata = {
  title: '코마데이 - 코인 전송 서비스',
  description: '코마데이 - 실시간 코인 전송 및 랭킹 관리 서비스',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'api-docs': '/api/docs',
    'ws-endpoint': '/ws/transactions',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#007bff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              transition: background-color 5000s ease-in-out 0s;
              -webkit-text-fill-color: #000 !important;
            }
          `
        }} />
        
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          자바스크립트를 활성화해주세요.
        </noscript>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
