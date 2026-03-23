package com.jsh.erp.controller;

import com.jsh.erp.base.BaseController;
import com.jsh.erp.base.TableDataInfo;
import com.jsh.erp.datasource.entities.OptionGroup;
import com.jsh.erp.datasource.entities.OptionItem;
import com.jsh.erp.service.OptionService;
import com.jsh.erp.utils.Constants;
import com.jsh.erp.utils.ErpInfo;
import com.jsh.erp.utils.StringUtil;
import com.jsh.erp.utils.Tools;
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
@RequestMapping(value = "/option")
@Api(tags = {"选项管理"})
public class OptionController extends BaseController {

    private final Logger logger = LoggerFactory.getLogger(OptionController.class);

    @Resource
    private OptionService optionService;

    /**
     * 从请求头 X-Access-Token 中解析当前租户ID
     */
    private Long getTenantId(HttpServletRequest request) {
        String token = request.getHeader("X-Access-Token");
        return Tools.getTenantIdByToken(token);
    }

    /**
     * 业务侧使用：根据 code 获取当前租户的选项列表（系统级+租户级合并）
     */
    @GetMapping(value = "/list")
    @ApiOperation(value = "获取选项列表（业务调用）")
    public String listOptions(@RequestParam("code") String code, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        Map<String, Object> objectMap = new HashMap<>();
        List<OptionItem> list = optionService.listOptions(code, tenantId);
        objectMap.put("rows", list);
        return returnJson(objectMap, ErpInfo.OK.name, ErpInfo.OK.code);
    }

    /**
     * 管理界面：分页查询当前租户某选项组下的全部配置项
     */
    @GetMapping(value = "/manage/list")
    @ApiOperation(value = "选项管理-列表")
    public TableDataInfo manageList(@RequestParam(value = Constants.SEARCH, required = false) String search,
                                    HttpServletRequest request) throws Exception {
        String groupCode = StringUtil.getInfo(search, "groupCode");
        String label = StringUtil.getInfo(search, "label");
        if (groupCode != null && groupCode.trim().isEmpty()) {
            groupCode = null;
        }
        if (label != null && label.trim().isEmpty()) {
            label = null;
        }
        Long tenantId = getTenantId(request);
        List<OptionItem> list = optionService.listForManage(groupCode, label, tenantId);
        return getDataTable(list);
    }

    /**
     * 新增选项（只允许操作当前租户数据）
     */
    @PostMapping(value = "/add")
    @ApiOperation(value = "选项管理-新增")
    public String add(@RequestBody OptionItem item, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        item.setTenantId(tenantId);
        item.setDeleteFlag("0");
        if (item.getEnabled() == null) item.setEnabled(true);
        if (item.getIsDefault() == null) item.setIsDefault(false);
        if (item.getHidden() == null) item.setHidden(false);
        if (item.getSort() == null) item.setSort(0);
        Map<String, Object> objectMap = new HashMap<>();
        int insert = optionService.addOption(item);
        return returnStr(objectMap, insert);
    }

    /**
     * 编辑选项（仅本租户选项可编辑）
     */
    @PutMapping(value = "/update")
    @ApiOperation(value = "选项管理-编辑")
    public String update(@RequestBody OptionItem item, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        Map<String, Object> objectMap = new HashMap<>();
        int update = optionService.updateOption(item, tenantId);
        return returnStr(objectMap, update);
    }

    /**
     * 逻辑删除选项（仅本租户选项可删除）
     */
    @DeleteMapping(value = "/delete")
    @ApiOperation(value = "选项管理-删除")
    public String delete(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        Map<String, Object> objectMap = new HashMap<>();
        int delete = optionService.deleteOption(id, tenantId);
        return returnStr(objectMap, delete);
    }

    // ---------- 选项组管理（租户隔离） ----------

    /**
     * 管理界面：分页查询选项组（系统级 + 当前租户）
     */
    @GetMapping(value = "/group/manage/list")
    @ApiOperation(value = "选项组管理-列表")
    public TableDataInfo groupManageList(@RequestParam(value = Constants.SEARCH, required = false) String search,
                                        HttpServletRequest request) throws Exception {
        String code = StringUtil.getInfo(search, "code");
        String name = StringUtil.getInfo(search, "name");
        if (code != null && code.trim().isEmpty()) code = null;
        if (name != null && name.trim().isEmpty()) name = null;
        Long tenantId = getTenantId(request);
        List<OptionGroup> list = optionService.listGroupsForManage(code, name, tenantId);
        return getDataTable(list);
    }

    /**
     * 新增选项组（归属当前租户）
     */
    @PostMapping(value = "/group/add")
    @ApiOperation(value = "选项组管理-新增")
    public String groupAdd(@RequestBody OptionGroup group, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        group.setTenantId(tenantId);
        if (group.getScope() == null || group.getScope().isEmpty()) {
            group.setScope("tenant");
        }
        Map<String, Object> objectMap = new HashMap<>();
        int insert = optionService.addGroup(group);
        return returnStr(objectMap, insert);
    }

    /**
     * 编辑选项组（仅本租户组可编辑）
     */
    @PutMapping(value = "/group/update")
    @ApiOperation(value = "选项组管理-编辑")
    public String groupUpdate(@RequestBody OptionGroup group, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        Map<String, Object> objectMap = new HashMap<>();
        int update = optionService.updateGroup(group, tenantId);
        return returnStr(objectMap, update);
    }

    /**
     * 逻辑删除选项组（仅本租户组可删除）
     */
    @DeleteMapping(value = "/group/delete")
    @ApiOperation(value = "选项组管理-删除")
    public String groupDelete(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Long tenantId = getTenantId(request);
        Map<String, Object> objectMap = new HashMap<>();
        int delete = optionService.deleteGroup(id, tenantId);
        return returnStr(objectMap, delete);
    }
}
