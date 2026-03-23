package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.WorkOrderProject;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface WorkOrderProjectMapperEx {

    List<WorkOrderProject> getByOrderId(@Param("orderId") Long orderId);

    int deleteByOrderId(@Param("orderId") Long orderId);

    int deleteByOrderIds(@Param("orderIds") String[] orderIds);

    int batchInsert(@Param("list") List<WorkOrderProject> list);
}
