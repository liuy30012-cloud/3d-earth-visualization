package com.earth3d.controller;

import com.earth3d.entity.DataPoint;
import com.earth3d.entity.User;
import com.earth3d.dto.DataPointRequest;
import com.earth3d.service.DataPointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data-points")
@RequiredArgsConstructor
public class DataPointController {

    private final DataPointService dataPointService;

    @GetMapping
    public ResponseEntity<List<DataPoint>> getUserDataPoints(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dataPointService.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<DataPoint> createDataPoint(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DataPointRequest request) {
        return ResponseEntity.ok(dataPointService.create(
                user.getId(),
                request.getName(),
                request.getLatitude(),
                request.getLongitude(),
                request.getCountry(),
                request.getType()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataPoint> updateDataPoint(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DataPointRequest request) {
        return ResponseEntity.ok(dataPointService.update(
                id,
                user.getId(),
                request.getName(),
                request.getLatitude(),
                request.getLongitude(),
                request.getCountry(),
                request.getType()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataPoint(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        dataPointService.deleteById(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/public/cities")
    public ResponseEntity<List<Map<String, Object>>> getPublicCities() {
        // 返回内置城市数据
        return ResponseEntity.ok(List.of());
    }
}
