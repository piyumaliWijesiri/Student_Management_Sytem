package com.student.Student_management_backend.controller;

import com.student.Student_management_backend.dto.LoginRequest;
import com.student.Student_management_backend.dto.RegisterRequest;
import com.student.Student_management_backend.model.Student;
import com.student.Student_management_backend.model.User;
import com.student.Student_management_backend.repository.StudentRepository;
import com.student.Student_management_backend.repository.UserRepository;
import com.student.Student_management_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> registerStudent(@RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorBody("Username already taken"));
        }
        if (studentRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorBody("Email already registered"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user = userRepository.save(user);

        Student student = new Student();
        student.setStudentId(generateStudentId());
        student.setUser(user);
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setPhone(request.getPhone());
        student.setAddress(request.getAddress());
        student = studentRepository.save(student);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("studentId", student.getStudentId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Creates a plain User account with role ADMIN (or INSTRUCTOR) -- no Student record needed.
    // NOTE: this endpoint is left open for development/setup. Lock it down (e.g. remove it,
    // or protect it behind an existing ADMIN's token) before deploying anywhere real.
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, String> request) {

        String username = request.get("username");
        String password = request.get("password");
        String role = request.getOrDefault("role", "ADMIN"); // ADMIN or INSTRUCTOR

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(errorBody("username and password are required"));
        }
        if (!role.equals("ADMIN") && !role.equals("INSTRUCTOR")) {
            return ResponseEntity.badRequest().body(errorBody("role must be ADMIN or INSTRUCTOR"));
        }
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorBody("Username already taken"));
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String identifier = request.getIdentifier();

        Optional<User> userOpt = userRepository.findByUsername(identifier);

        if (userOpt.isEmpty()) {
            userOpt = studentRepository.findByEmail(identifier).map(Student::getUser);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody("Invalid username/email or password"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody("Invalid username/email or password"));
        }

        // Find the student record linked to this user (if any) so the frontend gets a studentId
        Optional<Student> studentOpt = studentRepository.findByUser_UserId(user.getUserId());

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("token", token);
        studentOpt.ifPresent(student -> response.put("studentId", student.getStudentId()));

        return ResponseEntity.ok(response);
    }

    private String generateStudentId() {
        long count = studentRepository.count();
        return String.format("STU-%04d", 1000 + count + 1);
    }

    private Map<String, String> errorBody(String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        return body;
    }
}