package com.jsh.erp.controller;

import com.alibaba.fastjson.JSONObject;
import com.jsh.erp.base.BaseController;
import com.jsh.erp.base.TableDataInfo;
import com.jsh.erp.datasource.entities.ProjectEx;
import com.jsh.erp.datasource.vo.ProjectMaterialVo;
import com.jsh.erp.service.ProjectService;
import com.jsh.erp.service.ProjectMaterialService;
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
@RequestMapping(value = "/project")
@Api(tags = {"项目信息"})
public class ProjectController extends BaseController {
    private Logger logger = LoggerFactory.getLogger(ProjectController.class);

    @Resource
    private ProjectService projectService;
    @Resource
    private ProjectMaterialService projectMaterialService;

    @GetMapping(value = "/info")
    @ApiOperation(value = "根据id获取信息")
    public String getInfo(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        ProjectEx project = projectService.getProjectEx(id);
        Map<String, Object> objectMap = new HashMap<>();
        if (project != null) {
            objectMap.put("info", project);
            List<ProjectMaterialVo> projectMaterials = projectMaterialService.getProjectMaterialsWithDetail(id);
            objectMap.put("projectMaterials", projectMaterials);
            return returnJson(objectMap, ErpInfo.OK.name, ErpInfo.OK.code);
        } else {
            return returnJson(objectMap, ErpInfo.ERROR.name, ErpInfo.ERROR.code);
        }
    }

    @GetMapping(value = "/list")
    @ApiOperation(value = "获取信息列表")
    public TableDataInfo getList(@RequestParam(value = Constants.SEARCH, required = false) String search,
                                 HttpServletRequest request) throws Exception {
        String name = StringUtil.getInfo(search, "name");
        String categoryIdStr = StringUtil.getInfo(search, "categoryId");
        Long categoryId = StringUtil.isEmpty(categoryIdStr) ? null : Long.parseLong(categoryIdStr);
        String enabled = StringUtil.getInfo(search, "enabled");
        List<ProjectEx> list = projectService.select(name, categoryId, enabled);
        return getDataTable(list);
    }

    @PostMapping(value = "/add")
    @ApiOperation(value = "新增")
    public String add(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int insert = projectService.insertProject(obj, request);
        return returnStr(objectMap, insert);
    }

    @PutMapping(value = "/update")
    @ApiOperation(value = "修改")
    public String update(@RequestBody JSONObject obj, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int update = projectService.updateProject(obj, request);
        return returnStr(objectMap, update);
    }

    @DeleteMapping(value = "/delete")
    @ApiOperation(value = "删除")
    public String delete(@RequestParam("id") Long id, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = projectService.deleteProject(id, request);
        return returnStr(objectMap, delete);
    }

    @DeleteMapping(value = "/deleteBatch")
    @ApiOperation(value = "批量删除")
    public String batchDelete(@RequestParam("ids") String ids, HttpServletRequest request) throws Exception {
        Map<String, Object> objectMap = new HashMap<>();
        int delete = projectService.batchDeleteProject(ids, request);
        return returnStr(objectMap, delete);
    }

    @GetMapping(value = "/getListByCategoryId")
    @ApiOperation(value = "根据类别ID获取项目列表")
    public BaseResponseInfo getListByCategoryId(@RequestParam("categoryId") Long categoryId, HttpServletRequest request) throws Exception {
        BaseResponseInfo res = new BaseResponseInfo();
        try {
            List<ProjectEx> projectList = projectService.getProjectListByCategoryId(categoryId);
            res.code = 200;
            res.data = projectList;
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            res.code = 500;
            res.data = "获取数据失败";
        }
        return res;
    }
}
