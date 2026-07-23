// app/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { courseAPI, enrollmentAPI } from '@/lib/api';

const courseImages = [
  '/courses/course1.png',
  '/courses/course2.png',
  '/courses/course3.png',
];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;

      const [coursesRes, myEnrollmentsRes] = await Promise.all([
        courseAPI.getAll(),
        studentId ? enrollmentAPI.getMyCourses(studentId) : Promise.resolve({ data: [] }),
      ]);

      const enrolledCourseIds = new Set(
        (myEnrollmentsRes.data || []).map((enrollment: any) => enrollment.course?.courseId)
      );

      // Only keep courses the student is NOT already enrolled in
      const availableCourses = (coursesRes.data || []).filter(
        (course: any) => !enrolledCourseIds.has(course.courseId)
      );

      setCourses(availableCourses);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const studentId = typeof window !== 'undefined' ? localStorage.getItem('studentId') : null;

      if (!studentId) {
        setError('You must be logged in as a student to enroll');
        return;
      }

      setError('');
      setEnrollingId(courseId);
      await enrollmentAPI.enroll(studentId, courseId);
      setSuccessMessage('Successfully enrolled in the course!');
      await fetchCourses(); // Refresh -- enrolled course disappears from this list

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Courses</h1>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any, index: number) => (
            <div
              key={course.courseId}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
            >
              <img
                src={courseImages[index % courseImages.length]}
                alt={course.courseName}
                className="w-full h-40 object-contain bg-gray-50 p-4"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{course.courseName}</h3>
                <p className="text-sm text-gray-500 mt-1 flex-1">{course.description}</p>

                <button
                  onClick={() => handleEnroll(course.courseId)}
                  disabled={enrollingId === course.courseId}
                  className="mt-4 w-full py-2 rounded-md text-sm font-medium bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 transition-colors"
                >
                  {enrollingId === course.courseId ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">You're enrolled in every available course. Check back later for new ones!</p>
      )}
    </div>
  );
}