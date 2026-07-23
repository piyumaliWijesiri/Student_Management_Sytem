// app/students/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { studentAPI, enrollmentAPI } from '@/lib/api';

interface StudentForm {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  enrollmentYear: string;
}

const emptyForm: StudentForm = {
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  enrollmentYear: '',
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [enrolledCoursesByStudent, setEnrolledCoursesByStudent] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [role, setRole] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (auth.getRole() !== 'ADMIN' && auth.getRole() !== 'INSTRUCTOR') {
      router.push('/dashboard');
      return;
    }
    setRole(auth.getRole());
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      const studentList = response.data;
      setStudents(studentList);

      // Fetch each student's enrolled courses in parallel
      const enrollmentResults = await Promise.all(
        studentList.map((student: any) =>
          enrollmentAPI
            .getMyCourses(student.studentId)
            .then((res) => ({ studentId: student.studentId, courses: res.data }))
            .catch(() => ({ studentId: student.studentId, courses: [] }))
        )
      );

      const map: Record<string, string[]> = {};
      enrollmentResults.forEach(({ studentId, courses }: any) => {
        map[studentId] = courses.map((enrollment: any) => enrollment.course?.courseName).filter(Boolean);
      });
      setEnrolledCoursesByStudent(map);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowModal(true);
    setError('');
  };

  const openEditModal = (student: any) => {
    setForm({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      dateOfBirth: student.dateOfBirth || '',
      enrollmentYear: student.enrollmentYear?.toString() || '',
    });
    setIsEditing(true);
    setShowModal(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        enrollmentYear: form.enrollmentYear ? Number(form.enrollmentYear) : undefined,
      };

      if (isEditing) {
        await studentAPI.update(form.studentId, payload);
        setSuccessMessage('Student updated successfully!');
      } else {
        await studentAPI.create(payload);
        setSuccessMessage('Student added successfully!');
      }

      setShowModal(false);
      await fetchStudents();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studentAPI.delete(deleteTarget.studentId);
      setSuccessMessage('Student deleted successfully!');
      setDeleteTarget(null);
      await fetchStudents();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete student');
      setDeleteTarget(null);
    }
  };

  const isAdmin = role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Students</h1>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            + Add Student
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-200">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Student ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Enrolled Courses</th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium text-blue-900 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200">
            {students.length > 0 ? (
              students.map((student: any) => {
                const courses = enrolledCoursesByStudent[student.studentId] || [];
                return (
                  <tr key={student.studentId} className="hover:bg-blue-100/50">
                    <td className="px-4 py-3 text-sm text-gray-700">{student.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{student.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {courses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {courses.map((title, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-200 text-blue-800"
                            >
                              {title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No courses</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-sm text-right space-x-3">
                        <button
                          onClick={() => openEditModal(student)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(student)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="px-4 py-6 text-center text-gray-500">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && isAdmin && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Student' : 'Add Student'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  name="enrollmentYear"
                  placeholder="Enrollment year"
                  value={form.enrollmentYear}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isEditing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && isAdmin && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Delete Student</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}