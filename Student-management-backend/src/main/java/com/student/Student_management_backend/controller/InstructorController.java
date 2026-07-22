package com.student.Student_management_backend.controller;

import com.student.Student_management_backend.model.Instructor;
import com.student.Student_management_backend.repository.InstructorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructors")
@CrossOrigin(origins = "http://localhost:3000")
public class InstructorController {

    @Autowired
    private InstructorRepository instructorRepository;

    @GetMapping
    public List<Instructor> getAllInstructors() {
        return instructorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instructor> getInstructorById(@PathVariable String id) {
        return instructorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Instructor> createInstructor(@RequestBody Instructor instructor) {
        Instructor saved = instructorRepository.save(instructor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Instructor> updateInstructor(@PathVariable String id, @RequestBody Instructor updated) {
        return instructorRepository.findById(id).map(instructor -> {
            instructor.setFirstName(updated.getFirstName());
            instructor.setLastName(updated.getLastName());
            instructor.setEmail(updated.getEmail());
            instructor.setPhone(updated.getPhone());
            instructor.setHireDate(updated.getHireDate());
            return ResponseEntity.ok(instructorRepository.save(instructor));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable String id) {
        if (!instructorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        instructorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}