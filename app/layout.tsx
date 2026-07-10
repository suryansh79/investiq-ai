import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'InvestIQ AI — Multi-Agent Investment Research Platform',
  description:
    'AI-powered investment analysis platform using multi-agent workflows to deliver data-driven BUY, WATCH, or PASS recommendations with detailed reasoning and confidence scores.',
  keywords: [
    'AI investment analysis',
    'multi-agent research',
    'stock analysis',
    'investment recommendation',
    'LangGraph',
    'Gemini AI',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="gradient-bg noise-overlay antialiased">
        {children}
      </body>
    </html>
  );
}
