package com.jsh.erp.datasource.mappers;

import com.jsh.erp.datasource.entities.OptionItem;

public interface OptionItemMapper {
    int deleteByPrimaryKey(Long id);

    int insert(OptionItem record);

    int insertSelective(OptionItem record);

    OptionItem selectByPrimaryKey(Long id);

    int updateByPrimaryKeySelective(OptionItem record);

    int updateByPrimaryKey(OptionItem record);
}

