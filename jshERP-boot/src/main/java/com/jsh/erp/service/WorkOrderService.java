package com.jsh.erp.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.constants.BusinessConstants;
import com.jsh.erp.datasource.entities.Vehicle;
import com.jsh.erp.datasource.entities.WorkOrder;
import com.jsh.erp.datasource.entities.WorkOrderMaterial;
import com.jsh.erp.datasource.entities.WorkOrderProject;
import com.jsh.erp.datasource.entities.AccountHead;
import com.jsh.erp.datasource.entities.AccountItem;
import com.jsh.erp.datasource.mappers.WorkOrderMapper;
import com.jsh.erp.datasource.mappers.WorkOrderMapperEx;
import com.jsh.erp.datasource.mappers.WorkOrderMaterialMapperEx;
import com.jsh.erp.datasource.mappers.WorkOrderProjectMapperEx;
import com.jsh.erp.datasource.mappers.AccountHeadMapper;
import com.jsh.erp.datasource.mappers.AccountItemMapper;
import com.jsh.erp.exception.JshException;
import com.jsh.erp.utils.PageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class WorkOrderService {

    private final Logger logger = LoggerFactory.getLogger(WorkOrderService.class);
    private static final int STATUS_DRAFT = 0;
    private static final int STATUS_WAIT_DISPATCH = 1;
    private static final int STATUS_REPAIRING = 2;
    private static final int STATUS_FINISHED = 3;
    private static final int STATUS_WAIT_PAYMENT = 4;
    private static final int STATUS_PAID = 5;
    private static final int STATUS_CANCELLED = 6;
    private final ConcurrentMap<Long, Object> settleLocks = new ConcurrentHashMap<>();

    @Resource
    private WorkOrderMapper workOrderMapper;
    @Resource
    private WorkOrderMapperEx workOrderMapperEx;
    @Resource
    private WorkOrderProjectMapperEx workOrderProjectMapperEx;
    @Resource
    private WorkOrderMaterialMapperEx workOrderMaterialMapperEx;
    @Resource
    private LogService logService;
    @Resource
    private com.jsh.erp.datasource.mappers.VehicleMapper vehicleMapper;
    @Resource
    private AccountHeadMapper accountHeadMapper;
    @Resource
    private AccountItemMapper accountItemMapper;
    @Resource
    private UserService userService;

    public WorkOrder getById(Long id) throws Exception {
        try {
            return workOrderMapper.selectByPrimaryKey(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return null;
    }

    public List<WorkOrderProject> getProjects(Long orderId) throws Exception {
        try {
            return workOrderProjectMapperEx.getByOrderId(orderId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return new ArrayList<>();
    }

    public List<WorkOrderMaterial> getMaterials(Long orderId) throws Exception {
        try {
            return workOrderMaterialMapperEx.getByOrderId(orderId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return new ArrayList<>();
    }

    public List<WorkOrder> select(String orderNo, String customerName, String licensePlate,
                                  String status, String beginTime, String endTime) throws Exception {
        List<WorkOrder> list = null;
        try {
            PageUtils.startPage();
            list = workOrderMapperEx.selectByCondition(orderNo, customerName, licensePlate,
                    status, beginTime, endTime);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int insertWorkOrder(JSONObject obj, HttpServletRequest request) throws Exception {
        WorkOrder order = JSONObject.parseObject(obj.toJSONString(), WorkOrder.class);

        // 手动录入模式：先创建车辆档案，再把新 vehicleId 写入工单
        Boolean isManualVehicle = obj.getBoolean("isManualVehicle");
        if (Boolean.TRUE.equals(isManualVehicle) && order.getVehicleId() == null) {
            Long newVehicleId = createVehicleFromOrder(obj);
            if (newVehicleId != null) {
                order.setVehicleId(newVehicleId);
            }
        }

        order.setOrderNo(generateOrderNo());
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        order.setStatus(STATUS_WAIT_DISPATCH);
        int result = 0;
        try {
            result = workOrderMapper.insertSelective(order);
            saveProjectItems(order.getId(), obj.getJSONArray("projects"));
            saveMaterialItems(order.getId(), obj.getJSONArray("materials"));
            logService.insertLog("工单管理",
                    BusinessConstants.LOG_OPERATION_TYPE_ADD + order.getOrderNo(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    /**
     * 根据工单请求体中的车辆信息创建新的车辆档案，返回新车辆ID
     */
    private Long createVehicleFromOrder(JSONObject obj) {
        try {
            Vehicle vehicle = new Vehicle();
            String licensePlate = obj.getString("licensePlate");
            // 拆分省份前缀（首字符）和车牌号
            if (licensePlate != null && licensePlate.length() > 1) {
                vehicle.setLicensePlateProvince(licensePlate.substring(0, 1));
                vehicle.setLicensePlateNo(licensePlate.substring(1));
            }
            vehicle.setCustomerName(obj.getString("customerName"));
            vehicle.setCustomerPhone(obj.getString("customerPhone"));
            vehicle.setCustomerLevel(obj.getString("customerLevel"));
            vehicle.setCustomerAddress(obj.getString("customerAddress"));
            vehicle.setCustomerDetailAddress(obj.getString("customerDetailAddress"));
            vehicle.setBrandModel(obj.getString("vehicleInfo"));
            vehicle.setVehiclePurpose(obj.getString("vehiclePurpose"));
            vehicle.setVehicleType(obj.getString("vehicleType"));
            vehicle.setVin(obj.getString("vin"));
            vehicle.setEnabled(true);
            vehicle.setCreateTime(new Date());
            vehicle.setUpdateTime(new Date());
            vehicleMapper.insertSelective(vehicle);
            return vehicle.getId();
        } catch (Exception e) {
            logger.warn("自动创建车辆档案失败，将以无vehicleId方式保存工单", e);
            return null;
        }
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int updateWorkOrder(JSONObject obj, HttpServletRequest request) throws Exception {
        WorkOrder order = JSONObject.parseObject(obj.toJSONString(), WorkOrder.class);
        if (order.getId() == null) {
            throw new RuntimeException("工单ID不能为空");
        }
        WorkOrder existing = workOrderMapper.selectByPrimaryKey(order.getId());
        if (existing == null) {
            throw new RuntimeException("工单不存在或无权操作");
        }
        Integer s = existing.getStatus();
        if (s != null && (s == STATUS_PAID || s == STATUS_CANCELLED)) {
            throw new RuntimeException("已收款或已取消的工单不允许编辑");
        }
        // Status changes must go through the dedicated status/settlement APIs.
        order.setStatus(existing.getStatus());
        order.setUpdateTime(new Date());
        int result = 0;
        try {
            result = workOrderMapper.updateByPrimaryKeySelective(order);
            if (result > 0) {
                saveProjectItems(order.getId(), obj.getJSONArray("projects"));
                saveMaterialItems(order.getId(), obj.getJSONArray("materials"));
            }
            logService.insertLog("工单管理",
                    BusinessConstants.LOG_OPERATION_TYPE_EDIT + order.getOrderNo(), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int deleteWorkOrder(Long id, HttpServletRequest request) throws Exception {
        return batchDeleteByIds(id.toString(), request);
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int batchDeleteByIds(String ids, HttpServletRequest request) throws Exception {
        int result = 0;
        try {
            String[] idArray = ids.split(",");
            List<String> validIds = new ArrayList<>();
            for (String idStr : idArray) {
                WorkOrder existing = workOrderMapper.selectByPrimaryKey(Long.parseLong(idStr.trim()));
                if (existing == null) {
                    continue;
                }
                Integer s = existing.getStatus();
                if (s != null && (s == 5 || s == 6)) {
                    throw new RuntimeException("已收款或已取消的工单不允许删除（工单ID:" + idStr + "）");
                }
                validIds.add(idStr.trim());
            }
            if (validIds.isEmpty()) {
                return 0;
            }
            String[] validArray = validIds.toArray(new String[0]);
            result = workOrderMapperEx.batchDeleteByIds(new Date(), validArray);
            workOrderProjectMapperEx.deleteByOrderIds(validArray);
            workOrderMaterialMapperEx.deleteByOrderIds(validArray);
            logService.insertLog("工单管理", "批量删除,id集:" + String.join(",", validIds), request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int updateStatus(Long id, Integer status, HttpServletRequest request) throws Exception {
        if (id == null) {
            throw new RuntimeException("工单ID不能为空");
        }
        if (status == null) {
            throw new RuntimeException("工单状态不能为空");
        }
        WorkOrder existing = workOrderMapper.selectByPrimaryKey(id);
        if (existing == null || BusinessConstants.DELETE_FLAG_DELETED.equals(existing.getDeleteFlag())) {
            throw new RuntimeException("工单不存在或已删除");
        }
        Integer currentStatus = existing.getStatus();
        if (currentStatus == null) {
            throw new RuntimeException("工单状态异常，无法流转");
        }
        if (!canTransitionStatus(currentStatus, status)) {
            throw new RuntimeException("非法状态流转：" + getStatusName(currentStatus) + " -> " + getStatusName(status));
        }
        if (currentStatus.equals(status)) {
            return 1;
        }

        WorkOrder order = new WorkOrder();
        order.setId(id);
        order.setStatus(status);
        order.setUpdateTime(new Date());
        if (status == STATUS_FINISHED && existing.getActualFinishTime() == null) {
            order.setActualFinishTime(new Date());
        }
        int result = 0;
        try {
            result = workOrderMapper.updateByPrimaryKeySelective(order);
            logService.insertLog("工单管理", "更新状态，id:" + id + " status:" + status, request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    /**
     * 工单结算：生成一张收款单据并回写工单收款状态，金额将自动进入账户统计
     */
    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public void settleWorkOrder(Long workOrderId, BigDecimal settleAmount, Long accountId, HttpServletRequest request) throws Exception {
        if (workOrderId == null) {
            throw new RuntimeException("工单ID不能为空");
        }
        if (accountId == null) {
            throw new RuntimeException("结算账户不能为空");
        }
        if (settleAmount == null || settleAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("结算金额必须大于0");
        }

        synchronized (getSettleLock(workOrderId)) {
            WorkOrder order = workOrderMapper.selectByPrimaryKey(workOrderId);
            if (order == null || BusinessConstants.DELETE_FLAG_DELETED.equals(order.getDeleteFlag())) {
                throw new RuntimeException("工单不存在或已删除");
            }
            Integer currentStatus = order.getStatus();
            if (currentStatus == STATUS_PAID) {
                throw new RuntimeException("工单已收款，不能重复结算");
            }
            if (currentStatus == STATUS_CANCELLED) {
                throw new RuntimeException("已取消工单不能结算");
            }
            if (currentStatus == null || (currentStatus != STATUS_FINISHED && currentStatus != STATUS_WAIT_PAYMENT)) {
                throw new RuntimeException("只有已完工或待收款状态的工单才能结算");
            }

            BigDecimal payable = order.getPayableAmount() == null ? BigDecimal.ZERO : order.getPayableAmount();
            BigDecimal received = order.getReceivedAmount() == null ? BigDecimal.ZERO : order.getReceivedAmount();
            BigDecimal remaining = payable.subtract(received);
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("工单已无剩余应收金额，不能重复结算");
            }
            if (settleAmount.compareTo(remaining) > 0) {
                throw new RuntimeException("结算金额不能大于剩余应收金额");
            }

            Long userId = userService.getUserId(request);

            // Per-work-order lock prevents repeated clicks from creating duplicate settlements.
            AccountHead accountHead = new AccountHead();
            accountHead.setType("收款");
            accountHead.setOrganId(null);
            accountHead.setHandsPersonId(null);
            accountHead.setCreator(userId);
            accountHead.setChangeAmount(settleAmount);
            accountHead.setDiscountMoney(BigDecimal.ZERO);
            accountHead.setTotalPrice(settleAmount);
            accountHead.setAccountId(accountId);
            accountHead.setBillNo(order.getOrderNo()); // 可改为独立编号规则
            accountHead.setBillTime(new Date());
            accountHead.setRemark("工单结算：" + order.getOrderNo());
            accountHead.setStatus(BusinessConstants.BILLS_STATUS_AUDIT);
            accountHead.setSource("0");
            accountHead.setDeleteFlag(BusinessConstants.DELETE_FLAG_EXISTS);
            accountHead.setWorkOrderId(workOrderId);
            accountHeadMapper.insertSelective(accountHead);

            AccountItem item = new AccountItem();
            item.setHeaderId(accountHead.getId());
            item.setEachAmount(settleAmount);
            item.setRemark("工单结算：" + order.getOrderNo());
            accountItemMapper.insertSelective(item);

            BigDecimal newReceived = received.add(settleAmount);
            order.setReceivedAmount(newReceived);
            if (newReceived.compareTo(payable) >= 0) {
                order.setStatus(STATUS_PAID);
                order.setPaymentStatus(2);
            } else {
                order.setStatus(STATUS_WAIT_PAYMENT);
                order.setPaymentStatus(1);
            }
            order.setUpdateTime(new Date());
            workOrderMapper.updateByPrimaryKeySelective(order);

            logService.insertLog("工单管理", "工单结算，编号:" + order.getOrderNo() + " 金额:" + settleAmount, request);
        }
    }

    // ——— 私有工具方法 ————————————————————————————————

    private boolean canTransitionStatus(Integer currentStatus, Integer targetStatus) {
        if (currentStatus == null || targetStatus == null) {
            return false;
        }
        if (currentStatus.equals(targetStatus)) {
            return true;
        }
        switch (currentStatus) {
            case STATUS_WAIT_DISPATCH:
                return targetStatus == STATUS_REPAIRING || targetStatus == STATUS_CANCELLED;
            case STATUS_REPAIRING:
                return targetStatus == STATUS_FINISHED || targetStatus == STATUS_CANCELLED;
            case STATUS_FINISHED:
                return targetStatus == STATUS_WAIT_PAYMENT;
            case STATUS_WAIT_PAYMENT:
            case STATUS_PAID:
            case STATUS_CANCELLED:
                return false;
            default:
                return false;
        }
    }

    private String getStatusName(Integer status) {
        if (status == null) {
            return "未知";
        }
        switch (status) {
            case STATUS_WAIT_DISPATCH:
                return "待派工";
            case STATUS_REPAIRING:
                return "维修中";
            case STATUS_FINISHED:
                return "已完工";
            case STATUS_WAIT_PAYMENT:
                return "待收款";
            case STATUS_PAID:
                return "已收款";
            case STATUS_CANCELLED:
                return "已取消";
            default:
                return "未知";
        }
    }

    private Object getSettleLock(Long workOrderId) {
        return settleLocks.computeIfAbsent(workOrderId, key -> new Object());
    }

    private void saveProjectItems(Long orderId, JSONArray projects) throws Exception {
        workOrderProjectMapperEx.deleteByOrderId(orderId);
        if (projects == null || projects.isEmpty()) return;
        List<WorkOrderProject> list = new ArrayList<>();
        for (int i = 0; i < projects.size(); i++) {
            JSONObject p = projects.getJSONObject(i);
            String name = p.getString("projectName");
            if (name == null || name.trim().isEmpty()) continue;
            WorkOrderProject item = new WorkOrderProject();
            item.setOrderId(orderId);
            item.setProjectId(p.getLong("projectId"));
            item.setProjectName(name);
            item.setUnitPrice(toBigDecimal(p.getString("unitPrice")));
            item.setQuantity(toBigDecimal(p.getString("quantity"), BigDecimal.ONE));
            item.setDiscountRate(toBigDecimal(p.getString("discountRate"), new BigDecimal("100")));
            item.setAmount(toBigDecimal(p.getString("amount")));
            item.setWorkerName(p.getString("workerName"));
            item.setRemark(p.getString("remark"));
            item.setSort(i);
            list.add(item);
        }
        if (!list.isEmpty()) {
            workOrderProjectMapperEx.batchInsert(list);
        }
    }

    private void saveMaterialItems(Long orderId, JSONArray materials) throws Exception {
        workOrderMaterialMapperEx.deleteByOrderId(orderId);
        if (materials == null || materials.isEmpty()) return;
        List<WorkOrderMaterial> list = new ArrayList<>();
        for (int i = 0; i < materials.size(); i++) {
            JSONObject m = materials.getJSONObject(i);
            String name = m.getString("materialName");
            if (name == null || name.trim().isEmpty()) continue;
            WorkOrderMaterial item = new WorkOrderMaterial();
            item.setOrderId(orderId);
            item.setMaterialId(m.getLong("materialId"));
            item.setMaterialName(name);
            item.setStandard(m.getString("standard"));
            item.setModel(m.getString("model"));
            item.setUnit(m.getString("unit"));
            item.setUnitPrice(toBigDecimal(m.getString("unitPrice")));
            item.setQuantity(toBigDecimal(m.getString("quantity"), BigDecimal.ONE));
            item.setDiscountRate(toBigDecimal(m.getString("discountRate"), new BigDecimal("100")));
            item.setAmount(toBigDecimal(m.getString("amount")));
            item.setRemark(m.getString("remark"));
            item.setSort(i);
            list.add(item);
        }
        if (!list.isEmpty()) {
            workOrderMaterialMapperEx.batchInsert(list);
        }
    }

    private String generateOrderNo() {
        String dateStr = new SimpleDateFormat("yyyyMMdd").format(new Date());
        String timeStr = new SimpleDateFormat("HHmmssSSS").format(new Date());
        return "WO" + dateStr + timeStr;
    }

    private BigDecimal toBigDecimal(String val) {
        return toBigDecimal(val, BigDecimal.ZERO);
    }

    private BigDecimal toBigDecimal(String val, BigDecimal defaultVal) {
        if (val == null || val.trim().isEmpty()) return defaultVal;
        try {
            return new BigDecimal(val.trim());
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }
}
