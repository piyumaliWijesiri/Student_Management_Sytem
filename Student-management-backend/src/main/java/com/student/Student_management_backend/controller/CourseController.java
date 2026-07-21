// controller/CourseController.java
package com.student.Student_management_backend.controller;

import com.student.Student_management_backend.model.Course;
import com.student.Student_management_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    // Get all courses
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    // Get course by ID (String - course_id)
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable String id) {
        return courseRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Create course
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        // Check if course_id is provided
        if (course.getCourseId() == null || course.getCourseId().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.ok(savedCourse);
    }

    // Update course
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody Course updated) {
        return courseRepository.findById(id)
            .map(course -> {
                if (updated.getCourseName() != null) {
                    course.setCourseName(updated.getCourseName());
                }
                if (updated.getDescription() != null) {
                    course.setDescription(updated.getDescription());
                }
                if (updated.getCredits() != null) {
                    course.setCredits(updated.getCredits());
                }
                if (updated.getInstructorId() != null) {
                    course.setInstructorId(updated.getInstructorId());
                }
                course.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(courseRepository.save(course));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Delete course
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}