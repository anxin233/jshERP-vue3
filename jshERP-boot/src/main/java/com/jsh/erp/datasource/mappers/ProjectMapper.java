package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.Project;
import com.jsh.erp.datasource.entities.ProjectCategoryExample;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ProjectMapper {
    long countByExample(ProjectCategoryExample example);

    int deleteByExample(ProjectCategoryExample example);

    int deleteByPrimaryKey(Long id);

    int insert(Project record);

    int insertSelective(Project record);

    List<Project> selectByExample(ProjectCategoryExample example);

    Project selectByPrimaryKey(Long id);

    int updateByExampleSelective(@Param("record") Project record, @Param("example") ProjectCategoryExample example);

    int updateByExample(@Param("record") Project record, @Param("example") ProjectCategoryExample example);

    int updateByPrimaryKeySelective(Project record);

    int updateByPrimaryKey(Project record);
}
