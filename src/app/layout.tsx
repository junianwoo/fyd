import type { Metadata } from 'next'
import '@/app/globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'

export const metadata: Metadata = {
  title: {
    default: 'FindYourDoctor.ca – Find Family Doctors Accepting Patients in Ontario',
    template: '%s | FindYourDoctor.ca',
  },
  description:
    'Search for family doctors accepting new patients in Ontario. Get email alerts when doctors in your area start accepting. 2.5 million Ontarians are searching – find yours faster.',
  keywords: ['family doctor', 'Ontario', 'accepting patients', 'healthcare', 'doctor search'],
  authors: [{ name: 'FindYourDoctor.ca' }],
  metadataBase: new URL('https://findyourdoctor.ca'),
  alternates: { canonical: 'https://findyourdoctor.ca' },
  openGraph: {
    type: 'website',
    siteName: 'FindYourDoctor.ca',
    title: 'FindYourDoctor.ca – Find Family Doctors Accepting Patients in Ontario',
    description:
      'Search for family doctors accepting new patients in Ontario. Get email alerts when doctors start accepting.',
    url: 'https://findyourdoctor.ca',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@FindYourDoctorCA',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
