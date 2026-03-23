package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.ProjectMaterial;

public interface ProjectMaterialMapper {

    int insert(ProjectMaterial record);

    int insertSelective(ProjectMaterial record);

    ProjectMaterial selectByPrimaryKey(Long id);

    int updateByPrimaryKeySelective(ProjectMaterial record);

    int updateByPrimaryKey(ProjectMaterial record);

    int deleteByPrimaryKey(Long id);
}
