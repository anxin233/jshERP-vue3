package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.Project;
import com.jsh.erp.datasource.entities.ProjectEx;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public interface ProjectMapperEx {

    List<ProjectEx> selectByConditionProject(
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("enabled") String enabled);

    int addProject(Project project);

    int editProject(Project project);

    int batchDeleteProjectByIds(@Param("updateTime") Date updateTime, @Param("updater") Long updater, @Param("ids") String ids[]);

    ProjectEx getProjectById(@Param("id") Long id);

    List<ProjectEx> getProjectListByCategoryId(@Param("categoryId") Long categoryId);
}
