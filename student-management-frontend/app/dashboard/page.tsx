// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { courseAPI, studentAPI, enrollmentAPI } from '@/lib/api';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  enrolledCourses: number;
  recentActivity: any[];
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: 'blue' | 'emerald' | 'violet';
}) {
  const styles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', icon: 'bg-blue-900 text-white' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-900', icon: 'bg-emerald-600 text-white' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-900', icon: 'bg-violet-600 text-white' },
  }[accent];

  return (
    <div className={`${styles.bg} rounded-xl p-5 border border-black/5 flex items-center gap-4`}>
      <div className={`${styles.icon} w-11 h-11 rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${styles.text} mt-0.5`}>{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    enrolledCourses: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setRole(auth.getRole());
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const currentRole = auth.getRole();
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;

      const [studentsRes, coursesRes, myCoursesRes] = await Promise.all([
        studentAPI.getAll(),
        courseAPI.getAll(),
        currentRole === 'STUDENT' && studentId
          ? enrollmentAPI.getMyCourses(studentId)
          : Promise.resolve({ data: [] }),
      ]);

      setStats({
        totalStudents: studentsRes.data.length || 0,
        totalCourses: coursesRes.data.length || 0,
        enrolledCourses: myCoursesRes.data.length || 0,
        recentActivity: coursesRes.data.slice(0, 5) || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const user = auth.getUser();
  const isStudent = role === 'STUDENT';
  const firstName = user?.email?.split('@')[0] || 'there';

  const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    INSTRUCTOR: 'Instructor',
    STUDENT: 'Student',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-blue-900 uppercase tracking-wide mb-1">
            {role ? roleLabel[role] || role : ''} Dashboard
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening across your courses today.</p>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isStudent ? 'lg:grid-cols-3' : ''} gap-4 mb-8`}>
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            accent="blue"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 5a4 4 0 10-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <StatCard
            label="Available Courses"
            value={stats.totalCourses}
            accent="emerald"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V4H6.5A2.5 2.5 0 004 6.5v13z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          {isStudent && (
            <StatCard
              label="My Courses"
              value={stats.enrolledCourses}
              accent="violet"
              icon={
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
          </div>

          {stats.recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recentActivity.map((course: any) => (
                <div key={course.courseId} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{course.courseName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{course.description}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 shrink-0 ml-4">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 px-6 py-8 text-center text-sm">No recent courses available.</p>
          )}
        </div>
      </div>
    </div>
  );
}