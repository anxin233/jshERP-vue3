package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.WorkOrder;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public interface WorkOrderMapperEx {

    List<WorkOrder> selectByCondition(
            @Param("orderNo")       String orderNo,
            @Param("customerName")  String customerName,
            @Param("licensePlate")  String licensePlate,
            @Param("status")        String status,
            @Param("beginTime")     String beginTime,
            @Param("endTime")       String endTime
    );

    int batchDeleteByIds(
            @Param("updateTime") Date updateTime,
            @Param("ids")        String[] ids
    );
}
