package com.earth3d.service;

import com.earth3d.config.JwtUtil;
import com.earth3d.dto.AuthResponse;
import com.earth3d.dto.LoginRequest;
import com.earth3d.dto.RegisterRequest;
import com.earth3d.entity.User;
import com.earth3d.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    // 模拟验证码存储，接入真实服务后可替换为 Redis
    private final ConcurrentHashMap<String, String> codeStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> codeExpire = new ConcurrentHashMap<>();
    private static final long CODE_EXPIRE_MINUTES = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String phone = request.getPhone();
        String email = request.getEmail();

        if (phone == null && email == null) {
            throw new RuntimeException("手机号和邮箱至少填写一项");
        }

        // 验证验证码
        String codeKey = phone != null ? phone : email;
        String storedCode = codeStore.remove(codeKey);
        Long expireTime = codeExpire.remove(codeKey);
        if (storedCode == null || expireTime == null || System.currentTimeMillis() > expireTime) {
            throw new RuntimeException("验证码已过期，请重新获取");
        }
        if (!storedCode.equals(request.getCode())) {
            throw new RuntimeException("验证码错误");
        }

        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new RuntimeException("手机号已注册");
        }
        if (email != null && userRepository.existsByEmail(email)) {
            throw new RuntimeException("邮箱已注册");
        }

        User user = User.builder()
                .phone(phone)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(phone != null ? "用户" + phone.substring(7) : "用户")
                .build();
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getEmail());
        return AuthResponse.of(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt;
        if (request.getPhone() != null) {
            userOpt = userRepository.findByPhone(request.getPhone());
        } else if (request.getEmail() != null) {
            userOpt = userRepository.findByEmail(request.getEmail());
        } else {
            throw new RuntimeException("请输入手机号或邮箱");
        }

        User user = userOpt.orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getPhone(), user.getEmail());
        return AuthResponse.of(token, user);
    }

    public void sendSmsCode(String phone) {
        String code = generateCode();
        storeCode(phone, code);
        System.out.println("【模拟短信验证码】手机号: " + phone + ", 验证码: " + code);
    }

    public void sendEmailCode(String email) {
        String code = generateCode();
        storeCode(email, code);
        System.out.println("【模拟邮件验证码】邮箱: " + email + ", 验证码: " + code);
    }

    private String generateCode() {
        return String.valueOf((int) ((Math.random() * 9 + 1) * 100000));
    }

    private void storeCode(String key, String code) {
        codeStore.put(key, code);
        codeExpire.put(key, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(CODE_EXPIRE_MINUTES));
    }
}
