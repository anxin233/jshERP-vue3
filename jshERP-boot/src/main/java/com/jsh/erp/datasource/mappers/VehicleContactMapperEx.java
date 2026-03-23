package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.VehicleContact;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface VehicleContactMapperEx {
    List<VehicleContact> getByVehicleId(@Param("vehicleId") Long vehicleId);
    int deleteByVehicleId(@Param("vehicleId") Long vehicleId);
    int batchInsert(@Param("list") List<VehicleContact> list);
}
