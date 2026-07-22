// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data: { identifier: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phone: string;
    address: string;
  }) => api.post('/auth/register', data),
  registerInstructor: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    hireDate?: string;
  }) => api.post('/auth/register-instructor', data),
  // No backend /auth/logout endpoint (JWT is stateless) -- clear the token client-side instead
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Course APIs (courseId is a String, e.g. "ICT001" -- not a number)
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Enrollment APIs (separate from courses -- matches the backend's EnrollmentController)
export const enrollmentAPI = {
  enroll: (studentId: string, courseId: string) =>
    api.post('/enrollments', {
      student: { studentId },
      course: { courseId },
    }),
  getMyCourses: (studentId: string) => api.get(`/enrollments/student/${studentId}`),
  getByCourse: (courseId: string) => api.get(`/enrollments/course/${courseId}`),
  update: (enrollmentId: string, data: { grade: string }) =>
    api.put(`/enrollments/${enrollmentId}`, data),
  delete: (enrollmentId: string) => api.delete(`/enrollments/${enrollmentId}`),
};

// Student APIs (studentId is a String, e.g. "STU-1001")
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

// Course Material APIs (lecture notes: PDFs + video links, shown on a course's own page)
export const materialAPI = {
  getByCourse: (courseId: string) => api.get(`/materials/course/${courseId}`),

  uploadPdf: (courseId: string, title: string, file: File) => {
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', title);
    formData.append('file', file);
    return api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addVideo: (courseId: string, title: string, videoUrl: string) =>
    api.post('/materials/video', { courseId, title, videoUrl }),

  delete: (materialId: string) => api.delete(`/materials/${materialId}`),
};

// Instructor APIs (instructorId is a String, e.g. "INS-1001")
export const instructorAPI = {
  getAll: () => api.get('/instructors'),
  getById: (id: string) => api.get(`/instructors/${id}`),
  update: (id: string, data: any) => api.put(`/instructors/${id}`, data),
  delete: (id: string) => api.delete(`/instructors/${id}`),
};

export default api;
