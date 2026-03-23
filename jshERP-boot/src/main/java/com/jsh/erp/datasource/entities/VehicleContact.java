package com.jsh.erp.datasource.entities;

import java.util.Date;

public class VehicleContact {
    private Long id;
    private Long vehicleId;
    private String contactName;
    private String contactPhone;
    private Long tenantId;
    private String deleteFlag;
    private Date createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getContactName() { return contactName; }
    public void setContactName(String v) { this.contactName = v == null ? null : v.trim(); }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String v) { this.contactPhone = v == null ? null : v.trim(); }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getDeleteFlag() { return deleteFlag; }
    public void setDeleteFlag(String v) { this.deleteFlag = v == null ? null : v.trim(); }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}
