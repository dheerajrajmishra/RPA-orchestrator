package com.rpa.backend.entity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSetting {
    @Id
    @Column(name = "setting_key", nullable = false)
    private String settingKey;
    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    private String settingValue;
}
