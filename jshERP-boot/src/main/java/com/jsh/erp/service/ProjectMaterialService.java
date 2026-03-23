package com.jsh.erp.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.datasource.entities.ProjectMaterial;
import com.jsh.erp.datasource.mappers.ProjectMaterialMapper;
import com.jsh.erp.datasource.mappers.ProjectMaterialMapperEx;
import com.jsh.erp.datasource.vo.ProjectMaterialVo;
import com.jsh.erp.exception.JshException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ProjectMaterialService {
    private Logger logger = LoggerFactory.getLogger(ProjectMaterialService.class);

    @Resource
    private ProjectMaterialMapper projectMaterialMapper;
    @Resource
    private ProjectMaterialMapperEx projectMaterialMapperEx;

    public List<ProjectMaterialVo> getProjectMaterialsWithDetail(Long projectId) throws Exception {
        List<ProjectMaterialVo> list = null;
        try {
            list = projectMaterialMapperEx.getProjectMaterialsWithDetail(projectId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public void saveProjectMaterialsWithQuantity(Long projectId, JSONArray materials) throws Exception {
        try {
            // 先删除旧的关联关系
            projectMaterialMapperEx.deleteByProjectId(projectId, new Date());

            // 批量插入新的关联关系
            if (materials != null && !materials.isEmpty()) {
                List<ProjectMaterial> list = new ArrayList<>();
                Date now = new Date();
                // tenant_id 由 MyBatis Plus 租户插件自动注入，无需手动设置
                for (int i = 0; i < materials.size(); i++) {
                    JSONObject material = materials.getJSONObject(i);
                    ProjectMaterial pm = new ProjectMaterial();
                    pm.setProjectId(projectId);
                    pm.setMaterialId(material.getLong("materialId"));
                    pm.setQuantity(material.getInteger("quantity"));
                    pm.setCreateTime(now);
                    list.add(pm);
                }
                projectMaterialMapperEx.batchInsert(list);
            }
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public void deleteByProjectId(Long projectId) throws Exception {
        try {
            projectMaterialMapperEx.deleteByProjectId(projectId, new Date());
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public void deleteByProjectIds(String[] projectIds) throws Exception {
        try {
            if (projectIds != null && projectIds.length > 0) {
                projectMaterialMapperEx.deleteByProjectIds(projectIds, new Date());
            }
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
    }
}
