import type {Metadata} from 'next';
import './globals.css';
import Script from 'next/script';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'HelixSmash - Bouncing Adventure',
  description: 'A hyper-casual 3D game where you guide a ball down a rotating tower.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-body antialiased`}>
        {children}
        <Script src="https://yandex.ru/games/sdk/v2" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
