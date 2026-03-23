package com.jsh.erp.datasource.entities;

import java.math.BigDecimal;
import java.util.Date;

public class WorkOrder {
    private Long id;
    private String orderNo;
    private Long vehicleId;
    private String licensePlate;
    private String customerName;
    private String customerPhone;
    private String vehicleInfo;
    private String vin;
    private Integer mileage;
    private String faultDesc;
    private String handlerName;
    private Date intakeTime;
    private Date estimatedFinishTime;
    private Date actualFinishTime;
    /** 0草稿 1待派工 2维修中 3待结算 4已结算 5已取消 */
    private Integer status;
    private BigDecimal laborAmount;
    private BigDecimal materialAmount;
    private BigDecimal otherAmount;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal payableAmount;
    /** 0未付 1部分付款 2已付清 */
    private Integer paymentStatus;
    private String remark;
    private Date createTime;
    private Date updateTime;
    private Long tenantId;
    private String deleteFlag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getVehicleInfo() { return vehicleInfo; }
    public void setVehicleInfo(String vehicleInfo) { this.vehicleInfo = vehicleInfo; }
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }
    public String getFaultDesc() { return faultDesc; }
    public void setFaultDesc(String faultDesc) { this.faultDesc = faultDesc; }
    public String getHandlerName() { return handlerName; }
    public void setHandlerName(String handlerName) { this.handlerName = handlerName; }
    public Date getIntakeTime() { return intakeTime; }
    public void setIntakeTime(Date intakeTime) { this.intakeTime = intakeTime; }
    public Date getEstimatedFinishTime() { return estimatedFinishTime; }
    public void setEstimatedFinishTime(Date estimatedFinishTime) { this.estimatedFinishTime = estimatedFinishTime; }
    public Date getActualFinishTime() { return actualFinishTime; }
    public void setActualFinishTime(Date actualFinishTime) { this.actualFinishTime = actualFinishTime; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public BigDecimal getLaborAmount() { return laborAmount; }
    public void setLaborAmount(BigDecimal laborAmount) { this.laborAmount = laborAmount; }
    public BigDecimal getMaterialAmount() { return materialAmount; }
    public void setMaterialAmount(BigDecimal materialAmount) { this.materialAmount = materialAmount; }
    public BigDecimal getOtherAmount() { return otherAmount; }
    public void setOtherAmount(BigDecimal otherAmount) { this.otherAmount = otherAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getPayableAmount() { return payableAmount; }
    public void setPayableAmount(BigDecimal payableAmount) { this.payableAmount = payableAmount; }
    public Integer getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(Integer paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
    public String getDeleteFlag() { return deleteFlag; }
    public void setDeleteFlag(String deleteFlag) { this.deleteFlag = deleteFlag; }
}
