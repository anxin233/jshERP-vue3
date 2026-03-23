package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.ProjectCategory;
import com.jsh.erp.datasource.vo.TreeNode;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface ProjectCategoryMapperEx {
    List<ProjectCategory> selectByConditionProjectCategory(
            @Param("name") String name,
            @Param("parentId") Integer parentId);

    List<TreeNode> getNodeTree(@Param("currentId")Long currentId);

    List<TreeNode> getNextNodeTree(Map<String, Object> parameterMap);

    int addProjectCategory(ProjectCategory pc);

    int batchDeleteProjectCategoryByIds(@Param("updateTime") Date updateTime, @Param("updater") Long updater, @Param("ids") String ids[]);

    int editProjectCategory(ProjectCategory pc);

    List<ProjectCategory> getProjectCategoryBySerialNo(@Param("serialNo") String serialNo, @Param("id") Long id);

    List<ProjectCategory> getProjectCategoryListByCategoryIds(@Param("parentIds") String[] categoryIds);

    List<ProjectCategory> getListByParentId(@Param("parentId") Long parentId);
}
