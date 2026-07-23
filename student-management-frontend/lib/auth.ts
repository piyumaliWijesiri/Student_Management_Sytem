// lib/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

export const auth = {
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  },

  getRole: () => {
    if (typeof window === 'undefined') return null;
    const decoded = auth.getUser();
    if (decoded?.role) return decoded.role;
    return localStorage.getItem('role');
  },

  // Stores login response fields in localStorage AND a cookie
  // (middleware.ts runs server-side and can only read cookies, not localStorage)
  saveSession: (data: { token: string; role: string; userId: string; username: string; studentId?: string }) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    if (data.studentId) localStorage.setItem('studentId', data.studentId);

    // set a cookie so middleware.ts can see it too
    document.cookie = `token=${data.token}; path=/; max-age=86400`;
  },

  // Clears session data only -- caller (e.g. TopNavbar) decides where to redirect
  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('studentId');
    document.cookie = 'token=; path=/; max-age=0';
  },
};