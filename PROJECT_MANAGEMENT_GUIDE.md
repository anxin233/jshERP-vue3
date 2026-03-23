# 项目管理模块实施指南

## 模块概述

本文档描述了如何在jshERP系统中实施项目管理模块，包括项目类别和项目信息两个子模块。

## 架构设计

### 数据库设计

#### 1. 项目类别表 (jsh_project_category)
- 支持树形结构（通过parent_id实现父子关系）
- 包含字段：id, name, category_level, parent_id, sort, serial_no, remark, create_time, update_time, tenant_id, delete_flag

#### 2. 项目信息表 (jsh_project)
- 关联项目类别（通过category_id外键）
- 核心字段：
  - name: 项目名称
  - category_id: 项目类别ID
  - hourly_rate: 工时单价（元/小时）
  - default_hours: 默认工时（小时）
  - enabled: 是否启用
  - remark: 备注

### 后端架构

```
Controller层 (ProjectCategoryController, ProjectController)
    ↓
Service层 (ProjectCategoryService, ProjectService)
    ↓
Mapper层 (ProjectCategoryMapper/Ex, ProjectMapper/Ex)
    ↓
XML映射 (ProjectCategoryMapperEx.xml, ProjectMapperEx.xml)
    ↓
Entity层 (ProjectCategory, Project, ProjectEx)
```

### 前端架构

```
views/project/
├── ProjectCategoryList.vue      # 项目类别列表页
├── ProjectList.vue               # 项目信息列表页
└── modules/
    ├── ProjectCategoryModal.vue  # 项目类别表单
    └── ProjectModal.vue          # 项目信息表单
```

## 实施步骤

### 第一步：执行数据库脚本

```bash
# 1. 创建数据表
mysql -u root -p jsh_erp < jshERP-boot/docs/project_management_migration.sql

# 2. 配置菜单
mysql -u root -p jsh_erp < jshERP-boot/docs/project_menu_config.sql
```

### 第二步：后端代码已创建

后端代码已完整创建，包括：

**Entity实体类：**
- `ProjectCategory.java` - 项目类别实体
- `ProjectCategoryExample.java` - 项目类别查询条件
- `Project.java` - 项目实体
- `ProjectEx.java` - 项目扩展实体（包含类别名称）

**Mapper接口：**
- `ProjectCategoryMapper.java` - 基础Mapper
- `ProjectCategoryMapperEx.java` - 扩展Mapper
- `ProjectMapper.java` - 基础Mapper
- `ProjectMapperEx.java` - 扩展Mapper

**XML映射文件：**
- `ProjectCategoryMapperEx.xml` - 项目类别SQL映射
- `ProjectMapperEx.xml` - 项目信息SQL映射

**Service层：**
- `ProjectCategoryService.java` - 项目类别业务逻辑
- `ProjectService.java` - 项目信息业务逻辑

**Controller层：**
- `ProjectCategoryController.java` - 项目类别REST接口
- `ProjectController.java` - 项目信息REST接口

### 第三步：前端代码已创建

前端代码已完整创建，包括：

**API接口封装：**
- 已在 `api/api.js` 中添加项目管理相关API

**页面组件：**
- `ProjectCategoryList.vue` - 项目类别列表
- `ProjectCategoryModal.vue` - 项目类别表单
- `ProjectList.vue` - 项目信息列表
- `ProjectModal.vue` - 项目信息表单

### 第四步：配置路由（需手动操作）

在 `jshERP-web/src/config/router.config.js` 中添加路由配置：

```javascript
{
  path: '/project',
  name: 'project',
  redirect: '/project/category',
  component: RouteView,
  meta: { title: '项目管理', keepAlive: true, icon: 'project', permission: ['project'] },
  children: [
    {
      path: '/project/category',
      name: 'ProjectCategoryList',
      component: () => import('@/views/project/ProjectCategoryList'),
      meta: { title: '项目类别', keepAlive: true, permission: ['project_category'] }
    },
    {
      path: '/project/info',
      name: 'ProjectList',
      component: () => import('@/views/project/ProjectList'),
      meta: { title: '项目信息', keepAlive: true, permission: ['project_info'] }
    }
  ]
}
```

### 第五步：重启服务

```bash
# 重启后端
cd jshERP-boot
mvn clean package
java -jar target/jshERP.jar

# 重启前端
cd jshERP-web
yarn serve
```

## 功能特性

### 项目类别管理
- ✅ 树形结构支持
- ✅ 增删改查功能
- ✅ 名称唯一性校验
- ✅ 批量删除
- ✅ 多租户隔离

### 项目信息管理
- ✅ 关联项目类别
- ✅ 工时单价管理
- ✅ 默认工时设置
- ✅ 启用/禁用状态
- ✅ 增删改查功能
- ✅ 批量删除
- ✅ 多租户隔离

## API接口说明

### 项目类别接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 列表查询 | GET | /projectCategory/list | 分页查询项目类别 |
| 详情查询 | GET | /projectCategory/info | 根据ID查询详情 |
| 新增 | POST | /projectCategory/add | 新增项目类别 |
| 修改 | PUT | /projectCategory/update | 修改项目类别 |
| 删除 | DELETE | /projectCategory/delete | 删除单个项目类别 |
| 批量删除 | DELETE | /projectCategory/deleteBatch | 批量删除项目类别 |
| 树形结构 | GET | /projectCategory/getTree | 获取树形结构数据 |
| 名称校验 | GET | /projectCategory/checkIsNameExist | 校验名称是否存在 |

### 项目信息接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 列表查询 | GET | /project/list | 分页查询项目信息 |
| 详情查询 | GET | /project/info | 根据ID查询详情 |
| 新增 | POST | /project/add | 新增项目 |
| 修改 | PUT | /project/update | 修改项目 |
| 删除 | DELETE | /project/delete | 删除单个项目 |
| 批量删除 | DELETE | /project/deleteBatch | 批量删除项目 |
| 按类别查询 | GET | /project/getListByCategoryId | 根据类别ID查询项目列表 |

## 测试验证

### 1. 数据库验证
```sql
-- 查看表结构
DESC jsh_project_category;
DESC jsh_project;

-- 查看示例数据
SELECT * FROM jsh_project_category;
SELECT * FROM jsh_project;

-- 查看菜单配置
SELECT * FROM jsh_function WHERE number LIKE 'project%';
```

### 2. 后端接口测试
访问 Swagger 文档：`http://localhost:9999/jshERP-boot/doc.html`
- 查找"项目类别"和"项目信息"接口组
- 测试各个接口功能

### 3. 前端功能测试
1. 登录系统
2. 在左侧菜单找到"项目管理"
3. 测试项目类别的增删改查
4. 测试项目信息的增删改查
5. 验证数据关联关系

## 注意事项

1. **多租户隔离**：所有数据操作都会自动添加租户ID过滤
2. **软删除**：删除操作只是标记delete_flag='1'，不会物理删除数据
3. **权限控制**：需要在用户角色中配置相应的菜单权限
4. **数据校验**：前后端都有数据校验，确保数据完整性

## 扩展建议

如需扩展功能，可以考虑：
1. 添加项目进度跟踪
2. 添加项目成员管理
3. 添加项目工时记录
4. 添加项目成本核算
5. 添加项目报表统计

## 技术支持

如遇到问题，请检查：
1. 数据库表是否正确创建
2. 后端服务是否正常启动
3. 前端路由是否正确配置
4. 菜单权限是否正确分配
5. 浏览器控制台是否有错误信息

---

**创建日期**：2026-03-09
**版本**：v1.0
**作者**：系统架构师
