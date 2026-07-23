// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { courseAPI, instructorAPI } from '@/lib/api';

const courseImages = [
  '/courses/course1.png',
  '/courses/course2.png',
  '/courses/course3.png',
];

export default function LandingPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([courseAPI.getAll(), instructorAPI.getAll()])
      .then(([coursesRes, instructorsRes]) => {
        setCourses(coursesRes.data);
        setInstructors(instructorsRes.data);
      })
      .catch((err) => {
        console.error('Failed to load public data', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Manage Your Learning Journey with Ease
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              A complete platform to enroll in courses, track progress, and learn from expert instructors.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-900 text-white rounded-md font-medium hover:bg-blue-800"
              >
                Get Started
              </Link>
              <Link
                href="#courses"
                className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
              >
                View Courses
              </Link>
            </div>
          </div>
          <div className="relative h-80 md:h-96">
            <Image
              src="/hero-image.jpg"
              alt="Students learning"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">Our Courses</h2>
          <p className="text-center text-gray-600 mb-10">Explore our available courses</p>

          {loading ? (
            <p className="text-center text-gray-500">Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-500">No courses available right now.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div
                  key={course.courseId}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <img
                    src={courseImages[index % courseImages.length]}
                    alt={course.courseName}
                    className="w-full h-32 object-contain mb-3"
                  />
                  <h3 className="font-semibold text-gray-900">{course.courseName}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instructors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-10">Our Instructors</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading instructors...</p>
          ) : instructors.length === 0 ? (
            <p className="text-center text-gray-500">No instructors to show.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {instructors.map((inst) => (
                <div key={inst.instructorId} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center text-2xl font-semibold text-blue-900">
                    {inst.firstName?.[0]}{inst.lastName?.[0]}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {inst.firstName} {inst.lastName}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}