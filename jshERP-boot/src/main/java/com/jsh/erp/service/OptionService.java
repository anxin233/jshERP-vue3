package com.jsh.erp.service;

import com.jsh.erp.datasource.entities.OptionGroup;
import com.jsh.erp.datasource.entities.OptionItem;
import com.jsh.erp.datasource.mappers.OptionGroupMapper;
import com.jsh.erp.datasource.mappers.OptionGroupMapperEx;
import com.jsh.erp.datasource.mappers.OptionItemMapper;
import com.jsh.erp.datasource.mappers.OptionItemMapperEx;
import com.jsh.erp.exception.BusinessRunTimeException;
import com.jsh.erp.exception.JshException;
import com.jsh.erp.utils.PageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class OptionService {

    private final Logger logger = LoggerFactory.getLogger(OptionService.class);

    @Resource
    private OptionGroupMapper optionGroupMapper;
    @Resource
    private OptionGroupMapperEx optionGroupMapperEx;
    @Resource
    private OptionItemMapper optionItemMapper;
    @Resource
    private OptionItemMapperEx optionItemMapperEx;

    /**
     * 业务调用：根据选项组编码与租户ID获取最终可用选项列表
     */
    public List<OptionItem> listOptions(String groupCode, Long tenantId) {
        List<OptionItem> list = new ArrayList<>();
        try {
            list = optionItemMapperEx.listByGroupAndTenant(groupCode, tenantId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        if (list == null) {
            return new ArrayList<>();
        }
        // 租户级覆盖系统级：按 value 分组，只保留同 value 中 tenantId 不为空的记录
        return list.stream()
                .collect(Collectors.groupingBy(OptionItem::getValue))
                .values()
                .stream()
                .map(items -> {
                    OptionItem tenantItem = items.stream()
                            .filter(i -> i.getTenantId() != null)
                            .findFirst()
                            .orElse(null);
                    return tenantItem != null ? tenantItem : items.get(0);
                })
                .filter(i -> i.getEnabled() != null && i.getEnabled())
                .sorted(Comparator.comparing(OptionItem::getSort, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(OptionItem::getId))
                .collect(Collectors.toList());
    }

    /**
     * 管理界面：仅查当前租户的选项；若指定了 groupCode 且该租户在该组下尚无任何选项，则先用系统默认选项初始化（复制为租户数据）
     */
    public List<OptionItem> listForManage(String groupCode, String label, Long tenantId) {
        List<OptionItem> list = new ArrayList<>();
        try {
            if (groupCode != null && !groupCode.isEmpty() && tenantId != null) {
                int count = optionItemMapperEx.countByGroupAndTenant(groupCode, tenantId);
                if (count == 0) {
                    seedTenantOptionsFromSystem(groupCode, tenantId);
                }
            }
            PageUtils.startPage();
            list = optionItemMapperEx.listForManage(groupCode, label, tenantId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 将系统级选项复制为当前租户的默认选项（仅在该组下尚无租户数据时调用）
     */
    private void seedTenantOptionsFromSystem(String groupCode, Long tenantId) {
        List<OptionItem> systemItems = optionItemMapperEx.listSystemByGroupCode(groupCode);
        if (systemItems == null || systemItems.isEmpty()) {
            return;
        }
        for (OptionItem sys : systemItems) {
            OptionItem tenantItem = new OptionItem();
            tenantItem.setGroupCode(groupCode);
            tenantItem.setTenantId(tenantId);
            tenantItem.setValue(sys.getValue());
            tenantItem.setLabel(sys.getLabel());
            tenantItem.setSort(sys.getSort());
            tenantItem.setEnabled(sys.getEnabled() != null ? sys.getEnabled() : true);
            tenantItem.setIsDefault(sys.getIsDefault());
            tenantItem.setHidden(sys.getHidden());
            tenantItem.setDeleteFlag("0");
            try {
                optionItemMapper.insertSelective(tenantItem);
            } catch (Exception e) {
                JshException.writeFail(logger, e);
            }
        }
    }

    public int addOption(OptionItem item) {
        int result = 0;
        try {
            result = optionItemMapper.insertSelective(item);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    public int updateOption(OptionItem item, Long currentTenantId) {
        if (currentTenantId == null) {
            return 0;
        }
        OptionItem existing = optionItemMapper.selectByPrimaryKey(item.getId());
        if (existing == null) {
            return 0;
        }
        if (existing.getTenantId() == null || !existing.getTenantId().equals(currentTenantId)) {
            throw new BusinessRunTimeException(301, "仅可编辑本租户的选项");
        }
        int result = 0;
        try {
            result = optionItemMapper.updateByPrimaryKeySelective(item);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    public int deleteOption(Long id, Long currentTenantId) {
        if (currentTenantId == null) {
            return 0;
        }
        OptionItem item = optionItemMapper.selectByPrimaryKey(id);
        if (item == null) {
            return 0;
        }
        if (item.getTenantId() == null || !item.getTenantId().equals(currentTenantId)) {
            throw new BusinessRunTimeException(301, "仅可删除本租户的选项");
        }
        int result = 0;
        try {
            item.setDeleteFlag("1");
            result = optionItemMapper.updateByPrimaryKeySelective(item);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    // ---------- 选项组管理（租户隔离） ----------

    /**
     * 管理界面：分页查询选项组（系统级 + 当前租户）
     */
    public List<OptionGroup> listGroupsForManage(String code, String name, Long tenantId) {
        List<OptionGroup> list = new ArrayList<>();
        try {
            PageUtils.startPage();
            list = optionGroupMapperEx.listForManage(code, name, tenantId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 新增选项组（当前租户）
     */
    public int addGroup(OptionGroup group) {
        int result = 0;
        try {
            if (group.getDeleteFlag() == null) {
                group.setDeleteFlag("0");
            }
            if (group.getEnabled() == null) {
                group.setEnabled(true);
            }
            result = optionGroupMapper.insertSelective(group);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    /**
     * 更新选项组（仅允许操作本租户的组）
     */
    public int updateGroup(OptionGroup group, Long currentTenantId) {
        if (currentTenantId == null) {
            return 0;
        }
        OptionGroup existing = optionGroupMapper.selectByPrimaryKey(group.getId());
        if (existing == null) {
            return 0;
        }
        if (existing.getTenantId() == null || !Objects.equals(existing.getTenantId(), currentTenantId)) {
            throw new BusinessRunTimeException(301, "仅可编辑本租户的选项组");
        }
        int result = 0;
        try {
            result = optionGroupMapper.updateByPrimaryKeySelective(group);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    /**
     * 逻辑删除选项组（仅允许删除本租户的组）
     */
    public int deleteGroup(Long id, Long currentTenantId) {
        if (currentTenantId == null) {
            return 0;
        }
        OptionGroup group = optionGroupMapper.selectByPrimaryKey(id);
        if (group == null) {
            return 0;
        }
        if (group.getTenantId() == null || !Objects.equals(group.getTenantId(), currentTenantId)) {
            throw new BusinessRunTimeException(301, "仅可删除本租户的选项组");
        }
        int result = 0;
        try {
            group.setDeleteFlag("1");
            result = optionGroupMapper.updateByPrimaryKeySelective(group);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }
}

