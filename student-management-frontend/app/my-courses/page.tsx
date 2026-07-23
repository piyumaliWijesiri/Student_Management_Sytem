// app/my-courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { enrollmentAPI } from '@/lib/api';

const courseImages = [
  '/courses/course1.png',
  '/courses/course2.png',
  '/courses/course3.png',
];

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchMyCourses();
  }, [router]);

  const fetchMyCourses = async () => {
    try {
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;
      if (!studentId) {
        setError('Could not identify your student account.');
        return;
      }
      const res = await enrollmentAPI.getMyCourses(studentId);
      setEnrollments(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Courses you're currently enrolled in.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any, index: number) => {
              const course = enrollment.course || {};
              return (
                <div
                  key={enrollment.enrollmentId}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={courseImages[index % courseImages.length]}
                      alt={course.courseName}
                      className="w-full h-40 object-contain bg-gradient-to-br from-blue-50 to-slate-100 p-4"
                    />
                    <span className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      Enrolled
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs font-mono text-gray-400 mb-1">{course.courseId}</p>
                    <h3 className="font-semibold text-gray-900 text-lg">{course.courseName}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex-1">{course.description}</p>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Grade</span>
                      <span
                        className={`text-sm font-semibold ${
                          enrollment.grade ? 'text-blue-900' : 'text-gray-400'
                        }`}
                      >
                        {enrollment.grade || 'Not graded yet'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <p className="text-gray-500 mb-3">You haven't enrolled in any courses yet.</p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}