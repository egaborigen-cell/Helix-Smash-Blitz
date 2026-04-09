import type {Metadata} from 'next';
import './globals.css';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap" rel="stylesheet" />
        <script src="https://yandex.ru/games/sdk/v2" async></script>
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
