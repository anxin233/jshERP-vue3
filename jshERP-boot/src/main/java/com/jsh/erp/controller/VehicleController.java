package com.jsh.erp.controller;

import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.base.BaseController;
import com.jsh.erp.base.TableDataInfo;
import com.jsh.erp.datasource.entities.Vehicle;
import com.jsh.erp.datasource.entities.VehicleContact;
import com.jsh.erp.service.VehicleService;
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
@RequestMapping(value = "/vehicle")
@Api(tags = {"客户车辆"})
public class VehicleController extends BaseController {
    private Logger logger = LoggerFactory.getLogger(VehicleController.class);

    @Resource
    private VehicleService vehicleService;

    @GetMapping(value = "/info")
    @ApiOperation(value = "根据id获取车辆信息")
    public String getInfo(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Vehicle vehicle = vehicleService.getVehicle(id);
        Map<String, Object> objectMap = new HashMap<>();
        if (vehicle != null) {
            objectMap.put("info", vehicle);
            List<VehicleContact> contacts = vehicleService.getContacts(id);
            objectMap.put("contacts", contacts);
            return returnJson(objectMap, ErpInfo.OK.name, ErpInfo.OK.code);
        } else {
            return returnJson(objectMap, ErpInfo.ERROR.name, ErpInfo.ERROR.code);
        }
    }

    @GetMapping(value = "/search")
    @ApiOperation(value = "关键字搜索车辆（车牌/姓名/手机/VIN），用于工单智能搜索")
    public String searchVehicles(@RequestParam("keyword") String keyword,
                                 HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        if (keyword == null || keyword.trim().length() < 1) {
            objectMap.put("rows", new java.util.ArrayList<>());
            return returnJson(objectMap, ErpInfo.OK.name, ErpInfo.OK.code);
        }
        List<com.jsh.erp.datasource.entities.Vehicle> list = vehicleService.searchByKeyword(keyword.trim());
        objectMap.put("rows", list);
        return returnJson(objectMap, ErpInfo.OK.name, ErpInfo.OK.code);
    }

    @GetMapping(value = "/list")
    @ApiOperation(value = "获取车辆列表")
    public TableDataInfo getList(@RequestParam(value = Constants.SEARCH, required = false) String search,
                                 HttpServletRequest request) throws Exception {
        String licensePlateNo = StringUtil.getInfo(search, "licensePlateNo");
        String customerName   = StringUtil.getInfo(search, "customerName");
        String customerPhone  = StringUtil.getInfo(search, "customerPhone");
        String enabled        = StringUtil.getInfo(search, "enabled");
        List<Vehicle> list = vehicleService.select(licensePlateNo, customerName, customerPhone, enabled);
        return getDataTable(list);
    }

    @PostMapping(value = "/add")
    @ApiOperation(value = "新增车辆")
    public String add(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int insert = vehicleService.insertVehicle(obj, request);
        return returnStr(objectMap, insert);
    }

    @PutMapping(value = "/update")
    @ApiOperation(value = "修改车辆")
    public String update(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int update = vehicleService.updateVehicle(obj, request);
        return returnStr(objectMap, update);
    }

    @DeleteMapping(value = "/delete")
    @ApiOperation(value = "删除车辆")
    public String delete(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = vehicleService.deleteVehicle(id, request);
        return returnStr(objectMap, delete);
    }

    @DeleteMapping(value = "/deleteBatch")
    @ApiOperation(value = "批量删除车辆")
    public String batchDelete(@RequestParam("ids") String ids, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = vehicleService.batchDeleteVehicleByIds(ids, request);
        return returnStr(objectMap, delete);
    }

    @PutMapping(value = "/batchSetStatus")
    @ApiOperation(value = "批量启用/禁用")
    public BaseResponseInfo batchSetStatus(@RequestParam("enabled") Boolean enabled,
                                           @RequestParam("ids") String ids,
                                           HttpServletRequest request) throws Exception {
        BaseResponseInfo res = new BaseResponseInfo();
        try {
            vehicleService.batchSetStatus(enabled, ids, request);
            res.code = 200;
            res.data = "操作成功";
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            res.code = 500;
            res.data = "操作失败";
        }
        return res;
    }
}
