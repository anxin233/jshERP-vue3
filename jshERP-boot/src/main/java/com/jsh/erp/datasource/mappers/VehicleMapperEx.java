package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.Vehicle;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

public interface VehicleMapperEx {

    /**
     * 跨字段关键字搜索（车牌号、客户姓名、手机号、VIN码），用于工单录入时的智能搜索
     */
    List<Vehicle> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("limit")   int    limit);

    List<Vehicle> selectByConditionVehicle(
            @Param("licensePlateNo") String licensePlateNo,
            @Param("customerName") String customerName,
            @Param("customerPhone") String customerPhone,
            @Param("enabled") String enabled);

    int batchDeleteVehicleByIds(
            @Param("updateTime") Date updateTime,
            @Param("ids") String[] ids);

    int batchSetStatus(
            @Param("enabled") Boolean enabled,
            @Param("ids") String[] ids);
}
