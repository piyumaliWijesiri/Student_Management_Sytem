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

      // Only fetch "my courses" for students -- admins/instructors don't enroll
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
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const user = auth.getUser();
  const isStudent = role === 'STUDENT';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {user?.email || 'User'}!
      </h1>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isStudent ? 'lg:grid-cols-3' : ''} gap-6 mb-8`}>
        <div className="bg-blue-600 p-6 rounded-lg shadow-md">
          <h3 className="text-blue-100 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold mt-2 text-white">{stats.totalStudents}</p>
        </div>
        <div className="bg-green-600 p-6 rounded-lg shadow-md">
          <h3 className="text-green-100 text-sm font-medium">Available Courses</h3>
          <p className="text-3xl font-bold mt-2 text-white">{stats.totalCourses}</p>
        </div>
        {/* "My Courses" only makes sense for students */}
        {isStudent && (
          <div className="bg-purple-600 p-6 rounded-lg shadow-md">
            <h3 className="text-purple-100 text-sm font-medium">My Courses</h3>
            <p className="text-3xl font-bold mt-2 text-white">{stats.enrolledCourses}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((course: any) => (
              <div key={course.courseId} className="border-b pb-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.description}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {course.status || 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent courses available.</p>
        )}
      </div>
    </div>
  );
}
