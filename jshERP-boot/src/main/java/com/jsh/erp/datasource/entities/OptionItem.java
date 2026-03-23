package com.jsh.erp.datasource.entities;

import java.util.Date;

public class OptionItem {
    private Long id;
    private String groupCode;
    private Long tenantId;
    private String value;
    private String label;
    private Integer sort;
    private Boolean enabled;
    private Boolean isDefault;
    private Boolean hidden;
    private Date createTime;
    private Date updateTime;
    private String deleteFlag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGroupCode() { return groupCode; }
    public void setGroupCode(String groupCode) { this.groupCode = groupCode == null ? null : groupCode.trim(); }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value == null ? null : value.trim(); }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label == null ? null : label.trim(); }

    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getHidden() { return hidden; }
    public void setHidden(Boolean hidden) { this.hidden = hidden; }

    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }

    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

    public String getDeleteFlag() { return deleteFlag; }
    public void setDeleteFlag(String deleteFlag) { this.deleteFlag = deleteFlag == null ? null : deleteFlag.trim(); }
}

