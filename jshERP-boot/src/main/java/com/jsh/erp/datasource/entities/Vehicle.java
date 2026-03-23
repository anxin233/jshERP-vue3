package com.jsh.erp.datasource.entities;

import java.util.Date;

public class Vehicle {
    private Long id;
    private String vehiclePurpose;
    private String licensePlateProvince;
    private String licensePlateNo;
    private Boolean noPlate;
    private String vin;
    private Boolean noVin;
    private String vehicleType;
    private String productionYear;
    private String fuelType;
    private String vehicleCategory;
    private String bodyColor;
    private String images;
    private String vehicleSource;
    // 客户信息
    private String customerName;
    private String customerPhone;
    private String customerLevel;
    private String customerGender;
    private String customerAddress;
    private String customerDetailAddress;
    // 行驶证信息
    private String vehicleOwner;
    private String brandModel;
    private String engineNo;
    private Date registerDate;
    private Date issueDate;
    private String usageNature;
    private String registrationImages;
    // 年检与保险
    private Date annualCheckDate;
    private Date trafficInsuranceExpire;
    private Date commercialInsuranceExpire;
    private Boolean noInsurance;
    private String insuranceCompany;
    private String insuranceContact;
    private String insurancePhone;
    // 送修人信息
    private String repairerName;
    private String repairerContact;
    private String repairerGender;
    private String repairerIdNo;
    private String repairerRegion;
    private String repairerAddress;
    private String remark;
    private Boolean enabled;
    private Date createTime;
    private Date updateTime;
    private Long tenantId;
    private String deleteFlag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVehiclePurpose() { return vehiclePurpose; }
    public void setVehiclePurpose(String vehiclePurpose) { this.vehiclePurpose = vehiclePurpose; }
    public String getLicensePlateProvince() { return licensePlateProvince; }
    public void setLicensePlateProvince(String v) { this.licensePlateProvince = v == null ? null : v.trim(); }
    public String getLicensePlateNo() { return licensePlateNo; }
    public void setLicensePlateNo(String v) { this.licensePlateNo = v == null ? null : v.trim(); }
    public Boolean getNoPlate() { return noPlate; }
    public void setNoPlate(Boolean noPlate) { this.noPlate = noPlate; }
    public String getVin() { return vin; }
    public void setVin(String v) { this.vin = v == null ? null : v.trim(); }
    public Boolean getNoVin() { return noVin; }
    public void setNoVin(Boolean noVin) { this.noVin = noVin; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String v) { this.vehicleType = v; }
    public String getProductionYear() { return productionYear; }
    public void setProductionYear(String v) { this.productionYear = v; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String v) { this.fuelType = v; }
    public String getVehicleCategory() { return vehicleCategory; }
    public void setVehicleCategory(String v) { this.vehicleCategory = v; }
    public String getBodyColor() { return bodyColor; }
    public void setBodyColor(String v) { this.bodyColor = v; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getVehicleSource() { return vehicleSource; }
    public void setVehicleSource(String v) { this.vehicleSource = v; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String v) { this.customerName = v == null ? null : v.trim(); }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String v) { this.customerPhone = v == null ? null : v.trim(); }
    public String getCustomerLevel() { return customerLevel; }
    public void setCustomerLevel(String v) { this.customerLevel = v; }
    public String getCustomerGender() { return customerGender; }
    public void setCustomerGender(String v) { this.customerGender = v; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String v) { this.customerAddress = v; }
    public String getCustomerDetailAddress() { return customerDetailAddress; }
    public void setCustomerDetailAddress(String v) { this.customerDetailAddress = v; }
    public String getVehicleOwner() { return vehicleOwner; }
    public void setVehicleOwner(String v) { this.vehicleOwner = v == null ? null : v.trim(); }
    public String getBrandModel() { return brandModel; }
    public void setBrandModel(String v) { this.brandModel = v == null ? null : v.trim(); }
    public String getEngineNo() { return engineNo; }
    public void setEngineNo(String v) { this.engineNo = v == null ? null : v.trim(); }
    public Date getRegisterDate() { return registerDate; }
    public void setRegisterDate(Date registerDate) { this.registerDate = registerDate; }
    public Date getIssueDate() { return issueDate; }
    public void setIssueDate(Date issueDate) { this.issueDate = issueDate; }
    public String getUsageNature() { return usageNature; }
    public void setUsageNature(String v) { this.usageNature = v; }
    public String getRegistrationImages() { return registrationImages; }
    public void setRegistrationImages(String v) { this.registrationImages = v; }
    public Date getAnnualCheckDate() { return annualCheckDate; }
    public void setAnnualCheckDate(Date v) { this.annualCheckDate = v; }
    public Date getTrafficInsuranceExpire() { return trafficInsuranceExpire; }
    public void setTrafficInsuranceExpire(Date v) { this.trafficInsuranceExpire = v; }
    public Date getCommercialInsuranceExpire() { return commercialInsuranceExpire; }
    public void setCommercialInsuranceExpire(Date v) { this.commercialInsuranceExpire = v; }
    public Boolean getNoInsurance() { return noInsurance; }
    public void setNoInsurance(Boolean noInsurance) { this.noInsurance = noInsurance; }
    public String getInsuranceCompany() { return insuranceCompany; }
    public void setInsuranceCompany(String v) { this.insuranceCompany = v; }
    public String getInsuranceContact() { return insuranceContact; }
    public void setInsuranceContact(String v) { this.insuranceContact = v; }
    public String getInsurancePhone() { return insurancePhone; }
    public void setInsurancePhone(String v) { this.insurancePhone = v; }
    public String getRepairerName() { return repairerName; }
    public void setRepairerName(String v) { this.repairerName = v == null ? null : v.trim(); }
    public String getRepairerContact() { return repairerContact; }
    public void setRepairerContact(String v) { this.repairerContact = v; }
    public String getRepairerGender() { return repairerGender; }
    public void setRepairerGender(String v) { this.repairerGender = v; }
    public String getRepairerIdNo() { return repairerIdNo; }
    public void setRepairerIdNo(String v) { this.repairerIdNo = v; }
    public String getRepairerRegion() { return repairerRegion; }
    public void setRepairerRegion(String v) { this.repairerRegion = v; }
    public String getRepairerAddress() { return repairerAddress; }
    public void setRepairerAddress(String v) { this.repairerAddress = v; }
    public String getRemark() { return remark; }
    public void setRemark(String v) { this.remark = v == null ? null : v.trim(); }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getDeleteFlag() { return deleteFlag; }
    public void setDeleteFlag(String v) { this.deleteFlag = v == null ? null : v.trim(); }
}
