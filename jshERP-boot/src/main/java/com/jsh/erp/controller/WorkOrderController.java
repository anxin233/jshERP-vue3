package com.jsh.erp.controller;

import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.base.BaseController;
import com.jsh.erp.base.TableDataInfo;
import com.jsh.erp.datasource.entities.WorkOrder;
import com.jsh.erp.datasource.entities.WorkOrderMaterial;
import com.jsh.erp.datasource.entities.WorkOrderProject;
import com.jsh.erp.service.WorkOrderService;
import com.jsh.erp.service.UserService;
import com.jsh.erp.utils.BaseResponseInfo;
import com.jsh.erp.utils.Constants;
import com.jsh.erp.utils.ErpInfo;
import com.jsh.erp.utils.StringUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.jsh.erp.utils.ResponseJsonUtil.returnJson;
import static com.jsh.erp.utils.ResponseJsonUtil.returnStr;

@RestController
@RequestMapping(value = "/workOrder")
@Api(tags = {"工单管理"})
public class WorkOrderController extends BaseController {

    private final Logger logger = LoggerFactory.getLogger(WorkOrderController.class);

    @Resource
    private WorkOrderService workOrderService;
    @Resource
    private UserService userService;

    @GetMapping(value = "/list")
    @ApiOperation(value = "获取工单列表")
    public TableDataInfo getList(
            @RequestParam(value = Constants.SEARCH, required = false) String search,
            HttpServletRequest request) throws Exception {
        String orderNo      = StringUtil.getInfo(search, "orderNo");
        String customerName = StringUtil.getInfo(search, "customerName");
        String licensePlate = StringUtil.getInfo(search, "licensePlate");
        String status       = StringUtil.getInfo(search, "status");
        String beginTime    = StringUtil.getInfo(search, "beginTime");
        String endTime      = StringUtil.getInfo(search, "endTime");
        List<WorkOrder> list = workOrderService.select(orderNo, customerName, licensePlate,
                status, beginTime, endTime);
        return getDataTable(list);
    }

    @GetMapping(value = "/info")
    @ApiOperation(value = "获取工单详情（含项目和材料明细）")
    public String getInfo(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Map<String, Object> result = new HashMap<>();
        WorkOrder order = workOrderService.getById(id);
        if (order == null) {
            return returnJson(result, ErpInfo.ERROR.name, ErpInfo.ERROR.code);
        }
        List<WorkOrderProject>  projects  = workOrderService.getProjects(id);
        List<WorkOrderMaterial> materials = workOrderService.getMaterials(id);
        result.put("info",      order);
        result.put("projects",  projects);
        result.put("materials", materials);
        return returnJson(result, ErpInfo.OK.name, ErpInfo.OK.code);
    }

    @PostMapping(value = "/add")
    @ApiOperation(value = "新增工单")
    public String add(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int insert = workOrderService.insertWorkOrder(obj, request);
        return returnStr(objectMap, insert);
    }

    @PutMapping(value = "/update")
    @ApiOperation(value = "修改工单")
    public String update(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int update = workOrderService.updateWorkOrder(obj, request);
        return returnStr(objectMap, update);
    }

    @DeleteMapping(value = "/delete")
    @ApiOperation(value = "删除工单")
    public String delete(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = workOrderService.deleteWorkOrder(id, request);
        return returnStr(objectMap, delete);
    }

    @DeleteMapping(value = "/deleteBatch")
    @ApiOperation(value = "批量删除工单")
    public String batchDelete(@RequestParam("ids") String ids, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = workOrderService.batchDeleteByIds(ids, request);
        return returnStr(objectMap, delete);
    }

    @PutMapping(value = "/updateStatus")
    @ApiOperation(value = "更新工单状态")
    public BaseResponseInfo updateStatus(
            @RequestParam("id")     Long    id,
            @RequestParam("status") Integer status,
            HttpServletRequest request) throws Exception {
        BaseResponseInfo res = new BaseResponseInfo();
        try {
            workOrderService.updateStatus(id, status, request);
            res.code = 200;
            res.data = "操作成功";
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            res.code = 500;
            res.data = "操作失败";
        }
        return res;
    }

    @PostMapping(value = "/settle")
    @ApiOperation(value = "工单结算（生成收款单并纳入账户统计）")
    public BaseResponseInfo settle(@RequestBody JSONObject body, HttpServletRequest request) throws Exception {
        BaseResponseInfo res = new BaseResponseInfo();
        try {
            Long workOrderId = body.getLong("workOrderId");
            Long accountId   = body.getLong("accountId");
            String amountStr = body.getString("amount");
            java.math.BigDecimal amount = new java.math.BigDecimal(amountStr);
            workOrderService.settleWorkOrder(workOrderId, amount, accountId, request);
            res.code = 200;
            res.data = "结算成功";
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            res.code = 500;
            res.data = "结算失败：" + e.getMessage();
        }
        return res;
    }
}
