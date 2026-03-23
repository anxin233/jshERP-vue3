package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.OptionGroup;

public interface OptionGroupMapper {
    int deleteByPrimaryKey(Long id);

    int insert(OptionGroup record);

    int insertSelective(OptionGroup record);

    OptionGroup selectByPrimaryKey(Long id);

    int updateByPrimaryKeySelective(OptionGroup record);

    int updateByPrimaryKey(OptionGroup record);
}

