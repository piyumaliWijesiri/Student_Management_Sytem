// app/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/courses/CourseCard';
import { auth } from '@/lib/auth';
import { courseAPI } from '@/lib/api';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await courseAPI.enroll(courseId);
      await fetchCourses(); // Refresh to update enrollment status
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
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