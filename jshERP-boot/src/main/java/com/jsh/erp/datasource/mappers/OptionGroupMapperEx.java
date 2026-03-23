package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.OptionGroup;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 选项组扩展 Mapper：管理列表查询（租户隔离：系统级 + 当前租户）
 */
public interface OptionGroupMapperEx {

    /**
     * 管理列表：查询选项组，支持按编码、名称筛选；仅返回系统级(tenant_id IS NULL)或当前租户的组
     */
    List<OptionGroup> listForManage(@Param("code") String code,
                                    @Param("name") String name,
                                    @Param("tenantId") Long tenantId);
}
