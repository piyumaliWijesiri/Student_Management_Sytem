// components/layout/footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Student Management System</h3>
            <p className="text-gray-300 text-sm">
              A comprehensive platform for managing students, courses, and enrollment.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              <li><a href="/courses" className="hover:text-white">Courses</a></li>
              <li><a href="/my-courses" className="hover:text-white">My Courses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 text-sm">Email: support@studentms.com</p>
            <p className="text-gray-300 text-sm">Phone: +94 77 098 4387</p>
          </div>
        </div>
        
      </div>
    </footer>
  );
}