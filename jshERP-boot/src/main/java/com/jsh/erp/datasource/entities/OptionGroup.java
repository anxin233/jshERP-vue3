package com.jsh.erp.datasource.entities;

import java.util.Date;

public class OptionGroup {
    private Long id;
    private String code;
    private String name;
    private String scope;
    private Long tenantId;
    private String remark;
    private Boolean enabled;
    private Date createTime;
    private Date updateTime;
    private String deleteFlag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code == null ? null : code.trim(); }

    public String getName() { return name; }
    public void setName(String name) { this.name = name == null ? null : name.trim(); }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope == null ? null : scope.trim(); }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }

    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

    public String getDeleteFlag() { return deleteFlag; }
    public void setDeleteFlag(String deleteFlag) { this.deleteFlag = deleteFlag == null ? null : deleteFlag.trim(); }
}

