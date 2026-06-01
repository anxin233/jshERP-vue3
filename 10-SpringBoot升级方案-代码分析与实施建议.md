# Spring Boot 升级方案：代码分析与实施建议

## 1. 文档目的

本文用于评审当前 `jshERP-boot` 后端从 Spring Boot 2.0.0.RELEASE 升级的可行路径、风险点和实施顺序。

本文只基于当前代码和本地验证结果给出方案，不包含实际代码修改。

## 2. 当前结论

当前项目可以升级，但不建议直接跳到 Spring Boot 3.x 或 4.x。

推荐路线：

1. 第一阶段：从 `Spring Boot 2.0.0.RELEASE` 升级到 `Spring Boot 2.7.18`。
2. 第二阶段：在 2.7.18 稳定运行后，再规划升级到 `Spring Boot 3.5.x`。
3. 暂不建议直接升级到 `Spring Boot 4.0.x`。

原因是当前代码中存在较多 Boot 3/4 不兼容点，包括 `javax.*`、Springfox 2、旧版 MyBatis-Plus 拦截器、旧版 StarBlues 插件框架、旧 Flyway API 等。直接跨大版本升级会把多个问题叠在一起，定位成本很高。

## 3. 当前代码与环境事实

### 3.1 分支与工作区

当前分支：

```text
feature/upgrade-springboot
```

本地存在未跟踪文件：

```text
jshERP-boot/scripts/run_flyway_baseline_111.py
jshERP-boot/src/main/resources/application-remote-111.properties
```

升级前需要明确这两个文件是否属于本次升级范围。尤其 `application-remote-111.properties` 这类配置文件可能包含本地环境或敏感信息，不建议在未确认前纳入提交。

### 3.2 当前 Spring Boot 版本

当前后端父工程版本：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.0.RELEASE</version>
</parent>
```

位置：

```text
jshERP-boot/pom.xml
```

同时，`spring-boot-maven-plugin` 显式指定为 `2.0.3.RELEASE`。升级后建议移除该显式版本，让 Spring Boot parent BOM 统一管理。

### 3.3 Java 与 Maven 环境

本机当前环境：

```text
Java 11.0.28
Apache Maven 3.9.11
```

当前 `pom.xml` 中配置：

```xml
<java.version>1.8</java.version>
```

Spring Boot 2.7.18 支持 Java 11。如果后续运行环境统一使用 Java 11，第一阶段可以把编译目标从 Java 8 调整为 Java 11：

```xml
<java.version>11</java.version>
```

同时需要同步确认 `maven-compiler-plugin` 的 `source`、`target` 不再固定为 `1.8`，避免出现 `java.version=11` 但实际仍按 Java 8 编译的配置不一致。

这意味着第一阶段升级到 Boot 2.7.18 时可以使用本机 Java 11 编译运行，并将产物目标也统一到 Java 11；但第二阶段升级到 Boot 3.x 前，仍需要准备 Java 17 运行和构建环境。

### 3.4 当前编译状态

已执行：

```bash
mvn -DskipTests compile
```

结果：

```text
BUILD SUCCESS
```

说明当前代码在现有 Boot 2.0 依赖体系下可以编译。后续升级应以这个状态为基线逐步推进。

## 4. 官方版本约束

### 4.1 Spring Boot 2.7.18

Spring Boot 2.7.18 官方要求：

- Java 8 及以上。
- 兼容到 Java 21。
- 需要 Spring Framework 5.3.31 或以上。

因此，当前项目第一阶段升级到 2.7.18 不要求立即迁移到 Java 17，也不要求 `javax.*` 迁移到 `jakarta.*`。

### 4.2 Spring Boot 3.5.x

Spring Boot 3.5.14 官方要求：

- Java 17 及以上。
- Spring Framework 6.2.x。
- 嵌入式 Tomcat 10.1。
- Servlet 规范进入 Jakarta 体系。

因此，升级 Boot 3.5.x 必须处理 Java 17、`javax.*` 到 `jakarta.*`、Springfox 替换、MyBatis-Plus 拦截器升级等问题。

### 4.3 Spring Boot 4.0.x

Spring Boot 4.0.6 官方要求：

- Java 17 及以上。
- Spring Framework 7.0.x。
- 嵌入式 Tomcat 11。

Spring Boot 4.0 发布说明也建议：如果项目来自更早版本，应先升级到 Spring Boot 3.5，再迁移到 4.0。

因此，本项目当前不建议直接升级到 Boot 4.0。

## 5. 当前主要风险点

| 风险点 | 当前情况 | 对 Boot 2.7 的影响 | 对 Boot 3/4 的影响 | 建议 |
| --- | --- | --- | --- | --- |
| Spring Boot parent | 当前为 `2.0.0.RELEASE` | 需要升到 `2.7.18` | 需要先完成 2.7 过渡 | 第一阶段只改到 2.7.18 |
| Maven 插件版本 | `spring-boot-maven-plugin` 显式写 `2.0.3.RELEASE` | 可能与 parent 不一致 | 会继续放大版本不一致风险 | 移除显式版本 |
| Redis starter | 使用 `spring-boot-starter-redis 1.4.1.RELEASE` | Boot 2.7 下应改为 `spring-boot-starter-data-redis` | Boot 3 同样需要使用新 starter | 第一阶段替换 |
| Flyway | 当前 Boot 2.0 管理 Flyway 5.0.7，`FlywayConfig` 使用旧 API | Boot 2.7 会升级 Flyway，旧 API 需验证 | Boot 3/4 Flyway 版本更高，兼容风险更大 | 优先用 profile/manual baseline，减少自定义 API |
| MyBatis-Plus | 当前 `3.0.7.1`，使用 `PaginationInterceptor`、`TenantSqlParser` | 暂时不要和 Boot 一起升级 | 新版 MyBatis-Plus 需重写拦截器 | 分阶段处理 |
| 租户拦截器 | `TenantConfig.java` 使用旧插件体系 | Boot 2.7 阶段尽量保持不动 | Boot 3 阶段建议改为 `MybatisPlusInterceptor` | 第二阶段重构 |
| Swagger | 当前 Springfox 2.7.0 + swagger-bootstrap-ui | Boot 2.6+ 路径匹配策略变化，可能启动失败 | Springfox 不适合 Boot 3 | 短期加兼容配置，长期迁移 springdoc |
| 插件框架 | StarBlues `2.2.1-RELEASE` | 需验证与 Boot 2.7 兼容性 | Boot 3 兼容性更不确定 | 单独验证，必要时提供禁用插件 profile |
| `javax.*` | 代码中大量使用 `javax.servlet`、`javax.annotation`、`javax.mail` | Boot 2.7 可继续使用 | Boot 3/4 必须迁移到 Jakarta | 第二阶段统一迁移 |
| 邮件 | 使用 `com.sun.mail:javax.mail` | Boot 2.7 可暂留 | Boot 3 应迁移 Jakarta Mail | 第二阶段处理 |
| Lombok | 当前 `1.18.12` | 在较新 JDK 下可能有兼容风险 | Boot 3 阶段更应升级 | 第一阶段建议升级到较新稳定版 |
| 日志依赖 | `log4j-to-slf4j 2.15.0`，且 `jxl` 引入 `log4j 1.2.14` | 安全和维护风险 | 同样存在 | 第一阶段至少升级桥接依赖，后续评估 jxl 替代 |
| PageHelper | 当前 `pagehelper-spring-boot-starter 1.2.13` | 需要验证 Boot 2.7 兼容 | Boot 3 可能需升级 | 第一阶段先验证，必要时小步升级 |

## 6. 推荐升级路径

## 6.1 第零阶段：升级前准备

目标：确保升级基线干净、可回退、可复现。

建议动作：

1. 确认未跟踪文件是否要纳入版本管理。
2. 保持当前 `feature/upgrade-springboot` 分支专用于升级验证。
3. 记录当前可编译状态。
4. 准备一套可重复执行的启动验证命令。
5. 准备测试数据库，避免直接在重要业务库上验证 Flyway。

建议先执行：

```bash
git status --short --branch
mvn -DskipTests compile
```

## 6.2 第一阶段：升级到 Spring Boot 2.7.18

目标：尽量少改业务代码，让项目先在 Boot 2.7.18 下编译并启动。

建议修改范围：

1. `spring-boot-starter-parent` 改为 `2.7.18`。
2. 如果后续运行环境统一 Java 11，将 `<java.version>` 调整为 `11`，并同步调整 `maven-compiler-plugin` 的 `source`、`target`。
3. 移除 `spring-boot-maven-plugin` 显式版本。
4. 将 `spring-boot-starter-redis` 替换为 `spring-boot-starter-data-redis`。
5. Lombok 升级到较新稳定版，避免 JDK 11/17 编译兼容问题。
6. 日志桥接依赖交给 Boot BOM 管理，或升级到与 Boot 2.7 兼容版本。
7. 暂时保留 MyBatis-Plus `3.0.7.1`，不要和 Boot 升级混在同一阶段改租户拦截器。
8. 暂时保留 Springfox，但增加路径匹配兼容配置：

```properties
spring.mvc.pathmatch.matching-strategy=ant_path_matcher
```

9. Flyway 优先改回 Spring Boot 原生配置与 profile/manual baseline 思路。若继续保留 `FlywayConfig.java`，必须验证 Boot 2.7 管理的 Flyway API 是否仍兼容。
10. StarBlues 插件框架先不做大版本迁移，先验证启动；如启动失败，再单独处理插件框架兼容。

不建议在第一阶段做的事情：

1. 不建议同时升级到 MyBatis-Plus 3.5.x。
2. 不建议同时迁移 `javax.*` 到 `jakarta.*`。
3. 不建议同时替换整个 Swagger 体系。
4. 不建议同时升级到 Boot 3.x。

## 6.3 第一阶段验证清单

编译验证：

```bash
mvn -DskipTests compile
```

打包验证：

```bash
mvn -DskipTests package
```

启动验证建议分两步：

第一步，隔离框架升级问题：

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.flyway.enabled=false"
```

第二步，验证 Flyway：

```bash
mvn spring-boot:run
```

接口和页面冒烟：

1. 后端是否能启动到 `Started ErpApplication`。
2. `/jshERP-boot/doc.html` 是否可访问。
3. 验证码接口是否正常。
4. 登录接口是否正常。
5. 工单相关接口是否正常。
6. 项目管理接口是否正常。
7. 车辆管理接口是否正常。
8. 选项中心接口是否正常。
9. Redis 读写是否正常。
10. 插件相关接口是否正常，或确认插件功能当前可关闭。
11. Flyway 在空库和已有库上的行为是否符合预期。

## 6.4 第二阶段：升级到 Spring Boot 3.5.x

只有在 Boot 2.7.18 已经稳定后，才建议进入第二阶段。

目标：完成 Spring Framework 6、Jakarta EE、Java 17 体系迁移。

必要前置条件：

1. 本地和部署环境切到 Java 17。
2. 构建环境确认 Maven 版本满足 Boot 3.5 要求。
3. 所有 `javax.servlet.*` 迁移到 `jakarta.servlet.*`。
4. 所有 `javax.annotation.*` 迁移到对应 Jakarta 或 Spring 注入方式。
5. `javax.mail` 迁移到 Jakarta Mail。
6. Springfox + swagger-bootstrap-ui 替换为 springdoc-openapi。
7. MyBatis-Plus 升级到适合 Boot 3 的版本，并重写租户、分页拦截器。
8. 验证 StarBlues 插件框架是否存在 Boot 3 兼容版本。
9. 验证 Flyway 新版本是否需要额外数据库模块，例如 MySQL 场景下可能需要关注 `flyway-mysql`。

MyBatis-Plus 重构方向：

```java
MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
interceptor.addInnerInterceptor(new TenantLineInnerInterceptor(...));
interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
```

旧的 `PaginationInterceptor`、`TenantSqlParser`、`ISqlParserFilter` 不能作为 Boot 3 阶段的长期方案。

## 6.5 暂不推荐 Spring Boot 4.0

Boot 4.0 已经进入 Spring Framework 7 和 Tomcat 11 体系。

本项目当前还没有完成 Boot 2.7 和 Boot 3.5 迁移，直接跳到 Boot 4.0 会同时引入：

1. Java 17 基线。
2. Spring Framework 7。
3. Servlet 6.1。
4. 更高版本依赖约束。
5. 更大的三方库兼容风险。

因此 Boot 4.0 不应作为当前升级目标。

## 7. 建议提交拆分

建议按以下粒度提交，便于回滚和审查：

1. `chore: prepare spring boot upgrade branch`
   - 清理或确认未跟踪文件。
   - 记录当前基线。

2. `chore: upgrade spring boot to 2.7.18`
   - 修改 parent。
   - 移除插件显式版本。
   - 替换 Redis starter。
   - 增加必要兼容配置。

3. `fix: adapt flyway baseline for boot 2.7`
   - 优先使用 Boot 原生配置。
   - 如保留自定义策略，则只处理 Flyway API 兼容。

4. `fix: verify swagger compatibility on boot 2.7`
   - 保留 Springfox 时增加路径匹配兼容。
   - 如果仍失败，再单独迁移 Swagger。

5. `test: smoke test boot 2.7 runtime`
   - 补充或记录启动和核心接口验证结果。

第二阶段 Boot 3.5 不建议和以上提交混在一起。

## 8. 回滚策略

每个阶段都应保持可回退：

1. 只在 `feature/upgrade-springboot` 分支实施。
2. 每个风险点单独提交。
3. 如果 Boot 2.7 启动失败，先禁用 Flyway 验证框架启动，再逐步恢复。
4. 如果插件框架导致启动失败，先提供临时禁用插件 profile，确认主应用是否可启动。
5. 如果 Swagger 导致启动失败，先关闭 Swagger 配置，确认业务接口是否可启动。

## 9. 审核重点

请优先审核以下问题：

1. 是否同意第一阶段目标定为 `Spring Boot 2.7.18`，不直接升 Boot 3/4。
2. 是否确认后续运行环境统一使用 Java 11，并同意第一阶段将编译目标调整为 Java 11。
3. 是否允许第一阶段暂时保留 MyBatis-Plus `3.0.7.1`。
4. 是否允许第一阶段暂时保留 Springfox，并通过 `ant_path_matcher` 兼容。
5. 插件框架是否为当前必须功能。如果不是，可考虑先提供禁用插件 profile 降低升级风险。
6. Flyway 是否继续采用 profile/manual baseline，不做自动 baseline。
7. 本地未跟踪文件是否要提交、忽略或删除。
8. 部署环境是否能在第二阶段提供 Java 17。

## 10. 参考资料

1. Spring Boot 2.7.18 Reference Documentation  
   https://docs.spring.io/spring-boot/docs/2.7.18/reference/htmlsingle/

2. Spring Boot 2.7.18 Dependency Versions  
   https://docs.spring.io/spring-boot/docs/2.7.18/reference/html/dependency-versions.html

3. Spring Boot 2.6 Release Notes：MVC 路径匹配策略变更  
   https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.6-Release-Notes

4. Spring Boot 3.0 Migration Guide：Jakarta EE 迁移  
   https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide

5. Spring Boot 3.5 System Requirements  
   https://docs.spring.io/spring-boot/3.5/system-requirements.html

6. Spring Boot 4.0 System Requirements  
   https://docs.spring.io/spring-boot/system-requirements.html

7. Spring Boot 4.0 Release Notes  
   https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes

8. MyBatis-Plus 插件文档  
   https://baomidou.com/plugins/
