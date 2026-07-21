package com.student.Student_management_backend.repository;

import com.student.Student_management_backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByUser_UserId(UUID userId);
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
}