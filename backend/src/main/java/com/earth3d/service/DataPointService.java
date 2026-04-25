package com.earth3d.service;

import com.earth3d.entity.DataPoint;
import com.earth3d.repository.DataPointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DataPointService {

    private final DataPointRepository dataPointRepository;

    public List<DataPoint> findByUserId(Long userId) {
        return dataPointRepository.findByUserId(userId);
    }

    @Transactional
    public DataPoint create(Long userId, String name, Double latitude, Double longitude, String country, String type) {
        DataPoint point = DataPoint.builder()
                .userId(userId)
                .name(name)
                .latitude(latitude)
                .longitude(longitude)
                .country(country)
                .type(type != null ? type : "marker")
                .build();
        return dataPointRepository.save(point);
    }

    @Transactional
    public void deleteById(Long id, Long userId) {
        DataPoint point = dataPointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据点不存在"));
        if (!point.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }
        dataPointRepository.delete(point);
    }

    @Transactional
    public DataPoint update(Long id, Long userId, String name, Double latitude, Double longitude, String country, String type) {
        DataPoint point = dataPointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据点不存在"));
        if (!point.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作");
        }
        if (name != null) point.setName(name);
        if (latitude != null) point.setLatitude(latitude);
        if (longitude != null) point.setLongitude(longitude);
        if (country != null) point.setCountry(country);
        if (type != null) point.setType(type);
        return dataPointRepository.save(point);
    }
}
