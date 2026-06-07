package com.jsh.erp.service;

import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.constants.BusinessConstants;
import com.jsh.erp.datasource.entities.ProjectCategory;
import com.jsh.erp.datasource.entities.ProjectCategoryExample;
import com.jsh.erp.datasource.entities.User;
import com.jsh.erp.datasource.mappers.ProjectCategoryMapper;
import com.jsh.erp.datasource.mappers.ProjectCategoryMapperEx;
import com.jsh.erp.datasource.vo.TreeNode;
import com.jsh.erp.exception.BusinessRunTimeException;
import com.jsh.erp.exception.JshException;
import com.jsh.erp.utils.PageUtils;
import com.jsh.erp.utils.StringUtil;
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
public class ProjectCategoryService {
    private Logger logger = LoggerFactory.getLogger(ProjectCategoryService.class);

    @Resource
    private ProjectCategoryMapper projectCategoryMapper;
    @Resource
    private ProjectCategoryMapperEx projectCategoryMapperEx;
    @Resource
    private UserService userService;
    @Resource
    private LogService logService;

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

    public ProjectCategory getProjectCategory(long id) throws Exception {
        ProjectCategory result = null;
        try {
            result = projectCategoryMapper.selectByPrimaryKey(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return result;
    }

    public List<ProjectCategory> getProjectCategoryListByIds(String ids) throws Exception {
        List<Long> idList = StringUtil.strToLongList(ids);
        List<ProjectCategory> list = new ArrayList<>();
        try {
            ProjectCategoryExample example = new ProjectCategoryExample();
            example.createCriteria().andIdIn(idList);
            list = projectCategoryMapper.selectByExample(example);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    public List<ProjectCategory> getProjectCategory() throws Exception {
        ProjectCategoryExample example = new ProjectCategoryExample();
        List<ProjectCategory> list = null;
        try {
            list = projectCategoryMapper.selectByExample(example);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 获取所有未删除类别，用于下拉选择框（一次查询，无分页）
     */
    public List<ProjectCategory> getAllCategories() throws Exception {
        List<ProjectCategory> list = null;
        try {
            list = loadAllCategories();
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 获取指定父节点下的所有后代类别（含子孙）
     * 一次查出所有记录，在内存中递归组装，避免 N+1 查询
     * 根类别的 parent_id 在数据库中为 NULL
     */
    public List<ProjectCategory> getAllList(Long parentId) throws Exception {
        List<ProjectCategory> list = null;
        try {
            list = buildSubTree(parentId, loadAllCategories());
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    private List<ProjectCategory> loadAllCategories() throws Exception {
        ProjectCategoryExample example = new ProjectCategoryExample();
        example.createCriteria().andDeleteFlagNotEqualTo("1");
        example.setOrderByClause("sort");
        return projectCategoryMapper.selectByExample(example);
    }

    private List<ProjectCategory> buildSubTree(Long parentId, List<ProjectCategory> all) {
        List<ProjectCategory> res = new ArrayList<>();
        for (ProjectCategory pc : all) {
            boolean match = (parentId == null)
                    ? (pc.getParentId() == null)
                    : parentId.equals(pc.getParentId());
            if (match) {
                res.add(pc);
                res.addAll(buildSubTree(pc.getId(), all));
            }
        }
        return res;
    }

    public List<ProjectCategory> select(String name, Integer parentId) throws Exception {
        List<ProjectCategory> list = null;
        try {
            PageUtils.startPage();
            list = projectCategoryMapperEx.selectByConditionProjectCategory(name, parentId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int insertProjectCategory(JSONObject obj, HttpServletRequest request) throws Exception {
        getWritableTenantId();
        ProjectCategory projectCategory = JSONObject.parseObject(obj.toJSONString(), ProjectCategory.class);
        projectCategory.setTenantId(null);
        projectCategory.setCreateTime(new Date());
        projectCategory.setUpdateTime(new Date());
        int result = 0;
        try {
            result = projectCategoryMapper.insertSelective(projectCategory);
            logService.insertLog("项目类别",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_ADD).append(projectCategory.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int updateProjectCategory(JSONObject obj, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        ProjectCategory projectCategory = JSONObject.parseObject(obj.toJSONString(), ProjectCategory.class);
        projectCategory.setTenantId(tenantId);
        projectCategory.setUpdateTime(new Date());
        int result = 0;
        try {
            result = projectCategoryMapper.updateByPrimaryKeySelective(projectCategory);
            logService.insertLog("项目类别",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_EDIT).append(projectCategory.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int deleteProjectCategory(Long id, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        int result = 0;
        try {
            ProjectCategory projectCategory = getProjectCategory(id);
            if (projectCategory == null) {
                return 0;
            }
            projectCategory.setTenantId(tenantId);
            projectCategory.setDeleteFlag("1");
            projectCategory.setUpdateTime(new Date());
            result = projectCategoryMapper.updateByPrimaryKeySelective(projectCategory);
            logService.insertLog("项目类别",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_DELETE).append(projectCategory.getName()).toString(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int batchDeleteProjectCategory(String ids, HttpServletRequest request) throws Exception {
        Long tenantId = getWritableTenantId();
        int result = 0;
        try {
            String[] idArray = ids.split(",");
            result = projectCategoryMapperEx.batchDeleteProjectCategoryByIds(new Date(), userService.getCurrentUser().getId(), idArray, tenantId);
            logService.insertLog("项目类别",
                    "批量删除,id集:" + ids, request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    public int checkIsNameExist(Long id, String name) throws Exception {
        ProjectCategoryExample example = new ProjectCategoryExample();
        example.createCriteria().andNameEqualTo(name).andDeleteFlagNotEqualTo("1");
        List<ProjectCategory> list = null;
        try {
            list = projectCategoryMapper.selectByExample(example);
            if (list != null && list.size() > 0) {
                if (id == null) {
                    return list.size();
                } else {
                    return list.size() == 1 && list.get(0).getId().equals(id) ? 0 : list.size();
                }
            }
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return 0;
    }

    public List<TreeNode> getTree(Long id) throws Exception {
        List<TreeNode> list = null;
        try {
            list = projectCategoryMapperEx.getNodeTree(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }
}
