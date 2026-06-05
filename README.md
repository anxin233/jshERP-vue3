# 项目总述
* 很多人说管伊佳ERP（原名：华夏ERP，英文名：jshERP）是目前人气领先的国产ERP系统
* 虽然目前只有进销存+财务+生产的功能，但后面将会推出ERP的全部功能，有兴趣请帮点一下 **Star** 哦
* **官网地址：http://www.gyjerp.com  商务或技术交流，请联系QQ：752718920 微信：shenhua861584**
* 对物联网感兴趣的朋友欢迎关注我们的新开源系统：[管伊佳物联](https://gitee.com/jishenghua/gyj-iot)

# 网络版介绍
* 推荐使用网络版（198元1年）淘宝链接：https://item.taobao.com/item.htm?id=674169489573
* 平台地址：http://cloud.gyjerp.com 欢迎大家注册租户进行使用
* 网络版手机端请扫描下方二维码

![输入图片说明](https://cloud.gyjerp.com/static/android-code.png)
![输入图片说明](https://cloud.gyjerp.com/static/iphone-code.png)
![输入图片说明](https://cloud.gyjerp.com/static/weixin-code.png)

# 定制和插件
* 如有ERP私人定制需求，请将需求整理成文档，发给邮箱： **752718920@qq.com** ，我会及时回复哒
* 如需更多功能，欢迎购买作者小店的插件 https://shop104070207.taobao.com/ 谢谢支持

# 开发初衷
* 管伊佳ERP立志为中小企业提供开源好用的ERP软件，降低企业的信息化成本
* 个人开发者也可以使用管伊佳ERP进行二次开发，加快完成开发任务
* 初学JAVA的小伙伴可以下载源代码来进行学习交流

# 技术框架

**以下为当前仓库实际版本**（详见 `jshERP-boot/pom.xml`、`jshERP-web/package.json`）：

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端 | Spring Boot | 2.7.18 |
| 持久层 | MyBatis Plus | 3.0.7.1 |
| 数据库迁移 | Flyway | 启用（`db/migration/V*.sql`） |
| 前端 | Vue | 3.5.35 |
| UI | Ant Design Vue | 4.2.6 |
| 构建 | Vite | 8.0.16 |
| 路由 / 状态 | Vue Router / Vuex | 4.x |
| 模板风格 | Jeecg-Boot 系 | 侧栏 + 动态菜单 |
| 构建工具 | Maven | 3.3.9+ |

> 说明：上游 README 曾写 Vue 2.7 + Ant Design Vue 1.x；本仓库 **`jshERP-web` 已迁移为 Vue 3 + Ant Design Vue 4 + Vite**，不再使用 `vue.config.js`。AI 协作与开发细节见根目录 [`CLAUDE.md`](CLAUDE.md)。

# 仓库结构

```text
jshERP/
├── jshERP-boot/     # Spring Boot 后端
├── jshERP-web/      # Vue 3 前端（唯一 Web 端）
├── deploy/docker/   # Docker / Nginx 部署示例
└── *.md             # 升级记录、排查与方案文档
```

# 快速开始

### 依赖服务

* MySQL 8.0（库名 `jsh_erp`）
* Redis 6.2+

### 后端

```bash
cd jshERP-boot && mvn clean package
java -jar target/jshERP.jar
# 服务：http://localhost:9999/jshERP-boot
# 接口文档：http://localhost:9999/jshERP-boot/doc.html
```

已有老库首次接入 Flyway，见 [`jshERP-boot/src/main/resources/db/migration/README.md`](jshERP-boot/src/main/resources/db/migration/README.md)。

### 前端

```bash
cd jshERP-web && npm install
npm run serve
# 开发地址：http://localhost:3000
# API 代理见 vite.config.js（默认 /erp/jshERP-boot → 9999）
```

生产构建：`npm run build`。子路径部署参考 `jshERP-web/.env.subpath.example`。

# 开发环境

建议开发者使用以下环境，可以避免版本带来的问题：

* IDE: IntelliJ IDEA 2025.1.4.1（后端）、VS Code / Cursor（前端）
* DB: MySQL 8.0.24+
* JDK: **JDK 11+**（与 `pom.xml` 一致）
* Node: **Node 20.x**（如 20.17.0）
* Maven: Maven 3.3.9+
* Redis: 6.2.1+
* Nginx: 1.12.2+（生产部署）

# 服务器环境

* 数据库：MySQL 8.0.24+
* JAVA 平台：**JRE 11+**（运行 Spring Boot 2.7 打包产物）
* Redis：6.2.1+
* Nginx 代理：1.12.2+（静态资源 + 反向代理 `/jshERP-boot`）
* 操作系统：Windows、Linux 等

# 配套资料

* 需要用户手册请访问这里 https://www.gyjerp.com/doc/archive/user-manual.html
* 需要接口文档请查看这里 https://www.gyjerp.com/doc/archive/apidoc.html（本地亦可访问 `/jshERP-boot/doc.html`）
* 喜欢视频教程可以看这里 https://space.bilibili.com/540003552/channel/series
* 为方便大家搭建运行环境，分享了下载地址 https://pan.baidu.com/s/1jlild9uyGdQ7H2yaMx76zw  提取码:814g
* 不会打包的小伙伴，请下载此打包后的文件 https://share.weiyun.com/NDJNLhry 密码：vd3aig
* 不会部署的小伙伴，请参考部署教程 https://www.gyjerp.com/doc/archive/deploy.html；本仓库 Docker 示例见 [`deploy/docker/README.md`](deploy/docker/README.md)
* 部署后登录系统的默认租户账号：jsh，默认超管账户：admin，默认密码均为：123456
* 开发者文档：[`CLAUDE.md`](CLAUDE.md)（AI 协作 / 架构速查）、[`jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md`](jshERP-web/docs/ANTDV4_MIGRATION_STATUS.md)（前端迁移状态）

# 开源说明
* 本系统100%开源，遵守Apache-2.0协议，企业可以商用
* 支持全球73种语言，在登录后右上角“界面设置”页面进行切换

# 系统美图
* 首页
![输入图片说明](jshERP-web/public/static/screenshot/1.jpg)
* 零售管理
![输入图片说明](jshERP-web/public/static/screenshot/2.jpg)
* 采购管理
![输入图片说明](jshERP-web/public/static/screenshot/3.jpg)
* 销售管理
![输入图片说明](jshERP-web/public/static/screenshot/4.jpg)
* 仓库管理
![输入图片说明](jshERP-web/public/static/screenshot/5.jpg)
* 财务管理
![输入图片说明](jshERP-web/public/static/screenshot/6.jpg)
* 报表查询
![输入图片说明](jshERP-web/public/static/screenshot/7.jpg)
* 商品管理
![输入图片说明](jshERP-web/public/static/screenshot/8.jpg)
* 基本资料
![输入图片说明](jshERP-web/public/static/screenshot/9.jpg)
* 系统管理
![输入图片说明](jshERP-web/public/static/screenshot/10.jpg)

# 如何支持
* 开源不易，坚持更难！如果您觉得管伊佳ERP不错，不用请作者喝咖啡。
* 您可以将我们的云平台地址：https://cloud.gyjerp.com 发给您的家人或朋友，只要是开店的、办厂的、做批发的都可以用得上。
* 这将是对我们开源最大的支持！在此表示感谢！