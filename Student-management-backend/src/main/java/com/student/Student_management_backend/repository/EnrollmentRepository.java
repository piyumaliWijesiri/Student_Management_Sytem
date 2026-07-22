package com.student.Student_management_backend.repository;

import com.student.Student_management_backend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByStudent_StudentId(String studentId);
     List<Enrollment> findByCourse_CourseId(String courseId);
}