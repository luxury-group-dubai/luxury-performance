import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import localFont from 'next/font/local';
import { BrandIntro } from '@/components/brand-intro';
import { introBootstrap } from '@/lib/intro-bootstrap';
import { SiteMotion } from '@/components/site-motion';
import { SmoothScroll } from '@/components/smooth-scroll';
import 'lenis/dist/lenis.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { WhatsAppWidget } from '@/components/whatsapp-widget';
import './globals.css';
import './shop-shared.css';
import './display-type.css';
import { CartProvider } from '@/components/shop/cart-provider';
import { defaultSocialImage } from '@/lib/social-images';
const montserratUi = localFont({ src: './Montserrat-Variable-ui.woff2', variable: '--font-montserrat-ui', display: 'swap', preload: false, adjustFontFallback: false, fallback: [] });
const montserratFull = localFont({ src: './Montserrat-Variable.woff2', variable: '--font-montserrat-full', display: 'swap', preload: false });
// Let the opening photograph load before display type; CSS still loads the font when needed.
const michroma = localFont({ src: './Michroma-Regular-ui.woff2', weight: '400', style: 'normal', variable: '--font-michroma', display: 'swap', preload: false, adjustFontFallback: false, fallback: [] });
const michromaFull = localFont({ src: './Michroma-Regular.woff2', weight: '400', style: 'normal', variable: '--font-michroma-full', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'),
  title: { default: 'Luxury Performance — Beyond Ordinary', template: '%s | Luxury Performance' },
  description: 'Performance, aerodynamics, forged wheels and genuine OEM components for extraordinary cars. Discover Luxury Performance, Dubai. A division of The Luxury Group Dubai.',
  openGraph: { title: 'Luxury Performance — Beyond Ordinary', description: 'Exceptional cars. Individual expression. Discover Luxury Performance, Dubai.', type: 'website', locale: 'en_AE', images: [defaultSocialImage] },
  twitter: { card: 'summary_large_image', images: [defaultSocialImage] },
};
export const viewport: Viewport = { themeColor: '#101010' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${montserratUi.variable} ${montserratFull.variable} ${michroma.variable} ${michromaFull.variable}`}>
    <head>
      <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-PQPMSFG2" />
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      ` }} />
    </head>
    <body id="top"><script dangerouslySetInnerHTML={{ __html: introBootstrap }} /><CartProvider><BrandIntro /><div id="site-shell"><Header /><SmoothScroll /><SiteMotion /><main id="main">{children}</main><Footer /><WhatsAppWidget /></div></CartProvider><Analytics /><SpeedInsights /></body></html>;
}
