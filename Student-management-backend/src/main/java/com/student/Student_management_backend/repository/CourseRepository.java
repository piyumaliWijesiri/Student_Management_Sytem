// repository/CourseRepository.java
package com.student.Student_management_backend.repository;

import com.student.Student_management_backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {  // ✅ String (course_id)
    
    // Find by instructor ID
    List<Course> findByInstructorId(String instructorId);
    
    // Find by course name (contains)
    List<Course> findByCourseNameContaining(String courseName);
}