package com.earth3d.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DataPointRequest {
    @NotBlank(message = "名称不能为空")
    private String name;

    @NotNull(message = "纬度不能为空")
    @Min(value = -90, message = "纬度范围 -90 到 90")
    @Max(value = 90, message = "纬度范围 -90 到 90")
    private Double latitude;

    @NotNull(message = "经度不能为空")
    @Min(value = -180, message = "经度范围 -180 到 180")
    @Max(value = 180, message = "经度范围 -180 到 180")
    private Double longitude;

    private String country;
    private String type;
}
