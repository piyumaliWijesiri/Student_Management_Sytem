// app/instructors/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { instructorAPI, authAPI } from '@/lib/api';

interface AddForm {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
}

interface EditForm {
  instructorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
}

const emptyAddForm: AddForm = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  hireDate: '',
};

export default function InstructorsPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(emptyAddForm);
  const [saving, setSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<EditForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (auth.getRole() !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchInstructors();
  }, [router]);

  const fetchInstructors = async () => {
    try {
      const response = await instructorAPI.getAll();
      setInstructors(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editTarget) return;
    const { name, value } = e.target;
    setEditTarget({ ...editTarget, [name]: value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await authAPI.registerInstructor(addForm);
      setSuccessMessage('Instructor added successfully!');
      setShowAddModal(false);
      setAddForm(emptyAddForm);
      await fetchInstructors();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add instructor');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setError('');
    try {
      await instructorAPI.update(editTarget.instructorId, {
        firstName: editTarget.firstName,
        lastName: editTarget.lastName,
        email: editTarget.email,
        phone: editTarget.phone,
        hireDate: editTarget.hireDate,
      });
      setSuccessMessage('Instructor updated successfully!');
      setEditTarget(null);
      await fetchInstructors();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update instructor');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await instructorAPI.delete(deleteTarget.instructorId);
      setSuccessMessage('Instructor deleted successfully!');
      setDeleteTarget(null);
      await fetchInstructors();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete instructor');
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading instructors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Instructors</h1>
        <button
          onClick={() => {
            setAddForm(emptyAddForm);
            setShowAddModal(true);
            setError('');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Instructor
        </button>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Instructor ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-900 uppercase">Hire Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-blue-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200">
            {instructors.length > 0 ? (
              instructors.map((instructor: any) => (
                <tr key={instructor.instructorId} className="hover:bg-blue-100/50">
                  <td className="px-4 py-3 text-sm text-gray-700">{instructor.instructorId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {instructor.firstName} {instructor.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{instructor.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{instructor.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{instructor.hireDate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-3">
                    <button
                      onClick={() =>
                        setEditTarget({
                          instructorId: instructor.instructorId,
                          firstName: instructor.firstName || '',
                          lastName: instructor.lastName || '',
                          email: instructor.email || '',
                          phone: instructor.phone || '',
                          hireDate: instructor.hireDate || '',
                        })
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(instructor)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No instructors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Instructor Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add Instructor</h2>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={addForm.firstName}
                  onChange={handleAddChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={addForm.lastName}
                  onChange={handleAddChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={addForm.email}
                onChange={handleAddChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="username"
                  placeholder="Login username"
                  value={addForm.username}
                  onChange={handleAddChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Login password"
                  value={addForm.password}
                  onChange={handleAddChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={addForm.phone}
                  onChange={handleAddChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  name="hireDate"
                  value={addForm.hireDate}
                  onChange={handleAddChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Instructor Modal */}
      {editTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setEditTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edit Instructor</h2>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={editTarget.firstName}
                  onChange={handleEditChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={editTarget.lastName}
                  onChange={handleEditChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editTarget.email}
                onChange={handleEditChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={editTarget.phone}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  name="hireDate"
                  value={editTarget.hireDate}
                  onChange={handleEditChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Delete Instructor</h2>
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
