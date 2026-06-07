package com.jsh.erp.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.constants.BusinessConstants;
import com.jsh.erp.datasource.entities.Project;
import com.jsh.erp.datasource.entities.ProjectEx;
import com.jsh.erp.datasource.entities.ProjectMaterial;
import com.jsh.erp.datasource.entities.User;
import com.jsh.erp.datasource.mappers.ProjectMapper;
import com.jsh.erp.datasource.mappers.ProjectMapperEx;
import com.jsh.erp.exception.BusinessRunTimeException;
import com.jsh.erp.exception.JshException;
import com.jsh.erp.utils.PageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ProjectService {
    private Logger logger = LoggerFactory.getLogger(ProjectService.class);

    @Resource
    private ProjectMapper projectMapper;
    @Resource
    private ProjectMapperEx projectMapperEx;
    @Resource
    private UserService userService;
    @Resource
    private LogService logService;
    @Resource
    private ProjectMaterialService projectMaterialService;

    private Long getWritableTenantId() throws Exception {
        User userInfo = userService.getCurrentUser();
        if (userInfo == null
                || BusinessConstants.DEFAULT_MANAGER.equals(userInfo.getLoginName())
                || userInfo.getTenantId() == null
                || userInfo.getTenantId() == 0L) {
            throw new BusinessRunTimeException(301,
                    "\u8d85\u7ea7\u7ba1\u7406\u5458\u7981\u6b62\u64cd\u4f5c\u79df\u6237\u4e1a\u52a1\u6570\u636e");
        }
        return userInfo.getTenantId();
    }

    public Project getProject(long id) throws Exception {
        Project result = null;
        try {
            result = projectMapper.selectByPrimaryKey(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return result;
    }

    public ProjectEx getProjectEx(long id) throws Exception {
        ProjectEx result = null;
        try {
            result = projectMapperEx.getProjectById(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return result;
    }

    public List<ProjectEx> select(String name, Long categoryId, String enabled) throws Exception {
        List<ProjectEx> list = null;
        try {
            PageUtils.startPage();
            list = projectMapperEx.selectByConditionProject(name, categoryId, enabled);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 计算项目总价 = 工时费用 + 商品总价
     * 商品价格来自前端传入（已从数据库商品表取得），后端汇总计算，不信任前端的 totalPrice 字段
     */
    private java.math.BigDecimal calculateTotalPrice(java.math.BigDecimal hourlyRate, java.math.BigDecimal defaultHours, JSONArray materials) {
        java.math.BigDecimal totalPrice = java.math.BigDecimal.ZERO;

        if (hourlyRate != null && defaultHours != null) {
            totalPrice = totalPrice.add(hourlyRate.multiply(defaultHours));
        }

        if (materials != null && !materials.isEmpty()) {
            for (int i = 0; i < materials.size(); i++) {
                JSONObject material = materials.getJSONObject(i);
                Object priceObj = material.get("price");
                java.math.BigDecimal price = null;
                if (priceObj instanceof Number) {
                    price = new java.math.BigDecimal(priceObj.toString());
                } else if (priceObj instanceof String && !((String) priceObj).isEmpty()) {
                    try {
                        price = new java.math.BigDecimal((String) priceObj);
                    } catch (NumberFormatException e) {
                        logger.warn("无法解析商品价格: {}", priceObj);
                    }
                }
                Integer quantity = material.getInteger("quantity");
                if (price != null && quantity != null && quantity > 0) {
                    totalPrice = totalPrice.add(price.multiply(new java.math.BigDecimal(quantity)));
                }
            }
        }
        return totalPrice;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int insertProject(JSONObject obj, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        // 移除前端传来的 totalPrice，由后端计算
        obj.remove("totalPrice");

        Project project = JSONObject.parseObject(obj.toJSONString(), Project.class);
        project.setCreateTime(new Date());
        project.setUpdateTime(new Date());

        // 计算项目总价
        JSONArray materials = obj.getJSONArray("materials");
        java.math.BigDecimal totalPrice = calculateTotalPrice(project.getHourlyRate(), project.getDefaultHours(), materials);
        project.setTotalPrice(totalPrice);

        int result = 0;
        try {
            result = projectMapperEx.addProject(project);
            // 保存项目商品关联
            if (materials != null && !materials.isEmpty()) {
                projectMaterialService.saveProjectMaterialsWithQuantity(project.getId(), materials, tenantId);
            }
            logService.insertLog("项目信息",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_ADD).append(project.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int updateProject(JSONObject obj, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        // 移除前端传来的 totalPrice，由后端计算
        obj.remove("totalPrice");

        Project project = JSONObject.parseObject(obj.toJSONString(), Project.class);
        project.setTenantId(tenantId);
        project.setUpdateTime(new Date());

        // 计算项目总价
        JSONArray materials = obj.getJSONArray("materials");
        java.math.BigDecimal totalPrice = calculateTotalPrice(project.getHourlyRate(), project.getDefaultHours(), materials);
        project.setTotalPrice(totalPrice);

        int result = 0;
        try {
            result = projectMapperEx.editProject(project);
            // 更新项目商品关联
            if (materials != null) {
                projectMaterialService.saveProjectMaterialsWithQuantity(project.getId(), materials, tenantId);
            }
            logService.insertLog("项目信息",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_EDIT).append(project.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int deleteProject(Long id, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        int result = 0;
        try {
            Project project = getProject(id);
            if (project == null) {
                return 0;
            }
            project.setTenantId(tenantId);
            project.setDeleteFlag("1");
            project.setUpdateTime(new Date());
            result = projectMapper.updateByPrimaryKeySelective(project);
            if (result > 0) {
                projectMaterialService.deleteByProjectId(id, tenantId);
            }
            logService.insertLog("项目信息",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_DELETE).append(project.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int batchDeleteProject(String ids, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        int result = 0;
        try {
            String[] idArray = ids.split(",");
            result = projectMapperEx.batchDeleteProjectByIds(new Date(), userService.getCurrentUser().getId(), idArray, tenantId);
            if (result > 0) {
                projectMaterialService.deleteByProjectIds(idArray, tenantId);
            }
            logService.insertLog("项目信息",
                    "批量删除,id集:" + ids, request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    public List<ProjectEx> getProjectListByCategoryId(Long categoryId) throws Exception {
        List<ProjectEx> list = null;
        try {
            list = projectMapperEx.getProjectListByCategoryId(categoryId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }
}
