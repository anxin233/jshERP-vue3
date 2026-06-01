package com.jsh.erp.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Manual Flyway baseline entry for existing databases.
 *
 * <p>Keep baseline as an explicit profile action instead of guessing database
 * state at startup. The baseline version and history table come from
 * spring.flyway.* properties managed by Spring Boot.</p>
 */
@Configuration
@Profile("flyway-baseline")
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true")
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);
    private static final String DEFAULT_HISTORY_TABLE = "flyway_schema_history";

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy(Environment environment) {
        return flyway -> {
            String historyTable = safeIdentifier(
                    environment.getProperty("spring.flyway.table", DEFAULT_HISTORY_TABLE),
                    DEFAULT_HISTORY_TABLE);
            String baselineVersion = environment.getProperty("spring.flyway.baseline-version", "8");

            if (hasFlywayHistory(flyway.getConfiguration().getDataSource(), historyTable)) {
                log.info("Flyway: {} 已存在记录，跳过 baseline，直接执行 migrate()", historyTable);
                flyway.migrate();
                return;
            }

            log.info("Flyway: flyway-baseline profile 已启用，baseline 到版本 {}", baselineVersion);
            flyway.baseline();
            flyway.migrate();
        };
    }

    private boolean hasFlywayHistory(DataSource dataSource, String historyTable) {
        if (!tableExists(dataSource, historyTable)) {
            return false;
        }
        String sql = "SELECT COUNT(*) FROM `" + historyTable + "`";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() && rs.getInt(1) > 0;
        } catch (Exception e) {
            log.warn("Flyway: 读取 {} 失败: {}", historyTable, e.getMessage());
            return false;
        }
    }

    private boolean tableExists(DataSource dataSource, String tableName) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT COUNT(*) FROM information_schema.TABLES "
                             + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?")) {
            ps.setString(1, tableName);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        } catch (Exception e) {
            log.warn("Flyway: 检查表 {} 是否存在失败: {}", tableName, e.getMessage());
            return false;
        }
    }

    private String safeIdentifier(String value, String fallback) {
        if (value == null || !value.matches("[A-Za-z0-9_]+")) {
            return fallback;
        }
        return value;
    }
}
