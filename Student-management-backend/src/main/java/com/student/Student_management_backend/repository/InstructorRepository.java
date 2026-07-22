package com.student.Student_management_backend.repository;

import com.student.Student_management_backend.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstructorRepository extends JpaRepository<Instructor, String> {
    boolean existsByEmail(String email);
    Optional<Instructor> findByEmail(String email);
    Optional<Instructor> findByUser_UserId(UUID userId);
}