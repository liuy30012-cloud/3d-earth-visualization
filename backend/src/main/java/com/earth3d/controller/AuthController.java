package com.earth3d.controller;

import com.earth3d.dto.AuthResponse;
import com.earth3d.dto.LoginRequest;
import com.earth3d.dto.RegisterRequest;
import com.earth3d.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/sms/send")
    public ResponseEntity<String> sendSmsCode(@RequestParam String phone) {
        authService.sendSmsCode(phone);
        return ResponseEntity.ok("验证码已发送");
    }

    @PostMapping("/email/send")
    public ResponseEntity<String> sendEmailCode(@RequestParam String email) {
        authService.sendEmailCode(email);
        return ResponseEntity.ok("验证码已发送");
    }
}
