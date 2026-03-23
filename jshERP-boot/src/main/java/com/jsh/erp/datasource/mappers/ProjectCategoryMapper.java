package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.ProjectCategory;
import com.jsh.erp.datasource.entities.ProjectCategoryExample;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ProjectCategoryMapper {
    long countByExample(ProjectCategoryExample example);

    int deleteByExample(ProjectCategoryExample example);

    int deleteByPrimaryKey(Long id);

    int insert(ProjectCategory record);

    int insertSelective(ProjectCategory record);

    List<ProjectCategory> selectByExample(ProjectCategoryExample example);

    ProjectCategory selectByPrimaryKey(Long id);

    int updateByExampleSelective(@Param("record") ProjectCategory record, @Param("example") ProjectCategoryExample example);

    int updateByExample(@Param("record") ProjectCategory record, @Param("example") ProjectCategoryExample example);

    int updateByPrimaryKeySelective(ProjectCategory record);

    int updateByPrimaryKey(ProjectCategory record);
}
