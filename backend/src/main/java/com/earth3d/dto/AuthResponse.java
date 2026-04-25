package com.earth3d.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private Long userId;
    private String phone;
    private String email;
    private String nickname;
    private String avatar;

    public static AuthResponse of(String token, com.earth3d.entity.User user) {
        AuthResponse resp = new AuthResponse();
        resp.token = token;
        resp.userId = user.getId();
        resp.phone = user.getPhone();
        resp.email = user.getEmail();
        resp.nickname = user.getNickname();
        resp.avatar = user.getAvatar();
        return resp;
    }
}
