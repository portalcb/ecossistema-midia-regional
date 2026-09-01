import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecossistema de Mídia Regional',
  description: 'Turismo, agro, gastronomia, municípios e desenvolvimento regional em uma plataforma de mídia independente.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
