package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.WorkOrder;

public interface WorkOrderMapper {
    WorkOrder selectByPrimaryKey(Long id);
    int insertSelective(WorkOrder record);
    int updateByPrimaryKeySelective(WorkOrder record);
    int deleteByPrimaryKey(Long id);
}
