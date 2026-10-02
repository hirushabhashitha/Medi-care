import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediCore HMS - Hospital Management System',
  description: 'Professional hospital management system for patient care, appointments, pharmacy, laboratory, billing, and staff management.',
  keywords: 'hospital, management, HMS, medical, patient, appointment, pharmacy, laboratory, billing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
