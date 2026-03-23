package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.OptionItem;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface OptionItemMapperEx {

    /**
     * 根据选项组编码和租户查询所有选项（不含 delete_flag=1）
     */
    List<OptionItem> listByGroupAndTenant(@Param("groupCode") String groupCode,
                                          @Param("tenantId") Long tenantId);

    /**
     * 管理列表：仅查当前租户的选项（不含系统级），租户看到的都是自己的、可编辑
     */
    List<OptionItem> listForManage(@Param("groupCode") String groupCode,
                                   @Param("label") String label,
                                   @Param("tenantId") Long tenantId);

    /**
     * 统计某租户在某组下的选项条数（未删除）
     */
    int countByGroupAndTenant(@Param("groupCode") String groupCode, @Param("tenantId") Long tenantId);

    /**
     * 系统级选项（tenant_id 为空），用于复制为租户默认选项
     */
    List<OptionItem> listSystemByGroupCode(@Param("groupCode") String groupCode);
}

