package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.ProjectMaterial;
import com.jsh.erp.datasource.vo.ProjectMaterialVo;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public interface ProjectMaterialMapperEx {

    List<ProjectMaterial> getListByProjectId(@Param("projectId") Long projectId);

    int batchInsert(@Param("list") List<ProjectMaterial> list);

    int deleteByProjectId(@Param("projectId") Long projectId, @Param("updateTime") Date updateTime);

    List<Long> getMaterialIdsByProjectId(@Param("projectId") Long projectId);

    List<ProjectMaterialVo> getProjectMaterialsWithDetail(@Param("projectId") Long projectId);

    int deleteByProjectIds(@Param("projectIds") String[] projectIds, @Param("updateTime") Date updateTime);
}
