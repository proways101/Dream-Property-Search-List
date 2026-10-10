import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dream-Property-Search-List | Branching MLS Lifestyle Home Finder',
  description: 'AI-guided branching questionnaire that finds your dream property matching 80%+ parameters with interactive maps and Realtor.com links.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
