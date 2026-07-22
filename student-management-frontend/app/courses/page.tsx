// app/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/courses/CourseCard';
import { auth } from '@/lib/auth';
import { courseAPI, enrollmentAPI } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      // Build a set of course IDs the student is already enrolled in
      const enrolledCourseIds = new Set(
        (myEnrollmentsRes.data || []).map((enrollment: any) => enrollment.course?.courseId)
      );

      // Mark each course as enrolled or not so the card can disable the button
      const coursesWithStatus = (coursesRes.data || []).map((course: any) => ({
        ...course,
        enrolled: enrolledCourseIds.has(course.courseId),
      }));

      setCourses(coursesWithStatus);
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
      await enrollmentAPI.enroll(studentId, courseId);
      setSuccessMessage('Successfully enrolled in the course!');
      await fetchCourses(); // Refresh so the course now shows as "Enrolled"

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
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
        {auth.getRole() === 'ADMIN' && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Course
          </button>
        )}
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
          {courses.map((course: any) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No courses available at the moment.</p>
      )}
    </div>
  );
}
