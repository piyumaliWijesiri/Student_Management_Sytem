// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopNavbar from '@/components/layout/TopNavbar';
import Footer from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student Management System',
  description: 'Manage students, courses, and enrollment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <TopNavbar />
          <main className="flex-grow bg-gray-50">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}