package com.earth3d.repository;

import com.earth3d.entity.DataPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataPointRepository extends JpaRepository<DataPoint, Long> {
    List<DataPoint> findByUserId(Long userId);
}
