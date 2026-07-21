// components/courses/CourseCard.tsx
'use client';

import { useState } from 'react';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    instructorName?: string;
    enrolled?: boolean;
  };
  onEnroll: (id: number) => Promise<void>;
}

export default function CourseCard({ course, onEnroll }: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await onEnroll(course.id);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {course.instructorName || 'Instructor not assigned'}
          </span>
          {course.enrolled ? (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
              Enrolled
            </span>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}