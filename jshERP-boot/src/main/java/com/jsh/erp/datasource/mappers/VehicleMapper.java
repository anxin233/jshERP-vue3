package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.Vehicle;

public interface VehicleMapper {
    Vehicle selectByPrimaryKey(Long id);
    int insertSelective(Vehicle record);
    int updateByPrimaryKeySelective(Vehicle record);
    int deleteByPrimaryKey(Long id);
}
