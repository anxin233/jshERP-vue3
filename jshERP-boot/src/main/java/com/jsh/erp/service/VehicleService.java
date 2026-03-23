package com.jsh.erp.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.constants.BusinessConstants;
import com.jsh.erp.datasource.entities.Vehicle;
import com.jsh.erp.datasource.entities.VehicleContact;
import com.jsh.erp.datasource.mappers.VehicleContactMapperEx;
import com.jsh.erp.datasource.mappers.VehicleMapper;
import com.jsh.erp.datasource.mappers.VehicleMapperEx;
import com.jsh.erp.exception.JshException;
import com.jsh.erp.utils.PageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class VehicleService {
    private Logger logger = LoggerFactory.getLogger(VehicleService.class);

    @Resource
    private VehicleMapper vehicleMapper;
    @Resource
    private VehicleMapperEx vehicleMapperEx;
    @Resource
    private VehicleContactMapperEx vehicleContactMapperEx;
    @Resource
    private LogService logService;

    public Vehicle getVehicle(Long id) throws Exception {
        Vehicle result = null;
        try {
            result = vehicleMapper.selectByPrimaryKey(id);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return result;
    }

    public List<VehicleContact> getContacts(Long vehicleId) throws Exception {
        List<VehicleContact> list = null;
        try {
            list = vehicleContactMapperEx.getByVehicleId(vehicleId);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    /**
     * 跨字段关键字搜索，用于工单录入时的智能搜索下拉
     */
    public List<Vehicle> searchByKeyword(String keyword) throws Exception {
        List<Vehicle> list = null;
        try {
            list = vehicleMapperEx.searchByKeyword(keyword, 15);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    public List<Vehicle> select(String licensePlateNo, String customerName, String customerPhone, String enabled) throws Exception {
        List<Vehicle> list = null;
        try {
            PageUtils.startPage();
            list = vehicleMapperEx.selectByConditionVehicle(licensePlateNo, customerName, customerPhone, enabled);
        } catch (Exception e) {
            JshException.readFail(logger, e);
        }
        return list;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int insertVehicle(JSONObject obj, HttpServletRequest request) throws Exception {
        Vehicle vehicle = JSONObject.parseObject(obj.toJSONString(), Vehicle.class);
        vehicle.setCreateTime(new Date());
        vehicle.setUpdateTime(new Date());
        if (vehicle.getEnabled() == null) {
            vehicle.setEnabled(true);
        }
        int result = 0;
        try {
            result = vehicleMapper.insertSelective(vehicle);
            saveContacts(vehicle.getId(), obj.getJSONArray("contacts"));
            logService.insertLog("客户车辆",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_ADD)
                            .append(vehicle.getLicensePlateProvince()).append(vehicle.getLicensePlateNo()).toString(),
                    request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int updateVehicle(JSONObject obj, HttpServletRequest request) throws Exception {
        Vehicle vehicle = JSONObject.parseObject(obj.toJSONString(), Vehicle.class);
        vehicle.setUpdateTime(new Date());
        int result = 0;
        try {
            result = vehicleMapper.updateByPrimaryKeySelective(vehicle);
            saveContacts(vehicle.getId(), obj.getJSONArray("contacts"));
            logService.insertLog("客户车辆",
                    new StringBuffer(BusinessConstants.LOG_OPERATION_TYPE_EDIT)
                            .append(vehicle.getLicensePlateProvince()).append(vehicle.getLicensePlateNo()).toString(),
                    request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int deleteVehicle(Long id, HttpServletRequest request) throws Exception {
        return batchDeleteVehicleByIds(id.toString(), request);
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int batchDeleteVehicleByIds(String ids, HttpServletRequest request) throws Exception {
        int result = 0;
        try {
            String[] idArray = ids.split(",");
            result = vehicleMapperEx.batchDeleteVehicleByIds(new Date(), idArray);
            logService.insertLog("客户车辆", "批量删除,id集:" + ids, request);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    @Transactional(value = "transactionManager", rollbackFor = Exception.class)
    public int batchSetStatus(Boolean enabled, String ids, HttpServletRequest request) throws Exception {
        int result = 0;
        try {
            String[] idArray = ids.split(",");
            result = vehicleMapperEx.batchSetStatus(enabled, idArray);
        } catch (Exception e) {
            JshException.writeFail(logger, e);
        }
        return result;
    }

    private void saveContacts(Long vehicleId, JSONArray contacts) throws Exception {
        vehicleContactMapperEx.deleteByVehicleId(vehicleId);
        if (contacts != null && !contacts.isEmpty()) {
            List<VehicleContact> list = new ArrayList<>();
            Date now = new Date();
            for (int i = 0; i < contacts.size(); i++) {
                JSONObject c = contacts.getJSONObject(i);
                String name = c.getString("contactName");
                String phone = c.getString("contactPhone");
                if ((name != null && !name.isEmpty()) || (phone != null && !phone.isEmpty())) {
                    VehicleContact vc = new VehicleContact();
                    vc.setVehicleId(vehicleId);
                    vc.setContactName(name);
                    vc.setContactPhone(phone);
                    vc.setCreateTime(now);
                    list.add(vc);
                }
            }
            if (!list.isEmpty()) {
                vehicleContactMapperEx.batchInsert(list);
            }
        }
    }
}
