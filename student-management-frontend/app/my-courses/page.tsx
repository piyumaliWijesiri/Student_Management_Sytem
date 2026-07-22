// app/my-courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { enrollmentAPI } from '@/lib/api';

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
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
        setError('No student profile found for this account');
        setLoading(false);
        return;
      }

      const response = await enrollmentAPI.getMyCourses(studentId);
      setEnrollments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-xl">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment: any) => (
            <div key={enrollment.enrollmentId} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{enrollment.course?.title}</h3>
              <p className="text-gray-600 mb-4">{enrollment.course?.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Instructor: {enrollment.course?.instructorName || 'Unknown'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {enrollment.grade || 'Enrolled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
          <button
            onClick={() => router.push('/courses')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Browse Courses
          </button>
        </div>
      )}
    </div>
  );
}
