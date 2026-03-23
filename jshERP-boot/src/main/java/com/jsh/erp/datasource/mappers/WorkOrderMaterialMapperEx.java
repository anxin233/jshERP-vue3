package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.WorkOrderMaterial;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface WorkOrderMaterialMapperEx {

    List<WorkOrderMaterial> getByOrderId(@Param("orderId") Long orderId);

    int deleteByOrderId(@Param("orderId") Long orderId);

    int deleteByOrderIds(@Param("orderIds") String[] orderIds);

    int batchInsert(@Param("list") List<WorkOrderMaterial> list);
}
