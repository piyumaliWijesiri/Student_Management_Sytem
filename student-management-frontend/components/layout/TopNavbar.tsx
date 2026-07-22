// components/layout/TopNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

export default function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    setUserRole(auth.getRole());
  }, [pathname]);

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/courses', label: 'Courses' },
  ];

  // Students enroll in courses -- they get "My Courses" instead of managing Students/Instructors
  if (userRole === 'STUDENT') {
    navLinks.push({ href: '/my-courses', label: 'My Courses' });
  }

  // Admins and Instructors both manage students
  if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR') {
    navLinks.push({ href: '/students', label: 'Students' });
  }

  // Only Admins manage instructors
  if (userRole === 'ADMIN') {
    navLinks.push({ href: '/instructors', label: 'Instructors' });
  }

  return (
    <nav className="bg-blue-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Student MS" className="h-10 w-auto" />
            </Link>
          </div>

          {isAuthenticated && (
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? 'text-white border-b-2 border-white'
                      : 'text-blue-100 hover:text-white'
                  } px-3 py-2 text-sm font-medium transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-blue-100 hidden sm:inline">
                  {userRole}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-blue-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-blue-900 bg-white rounded-md hover:bg-blue-50"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
