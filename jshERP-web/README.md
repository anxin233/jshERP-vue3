jshERP-web Vue
====


Overview
----


#### 前端技术
 
- 基础框架：[ant-design-vue](https://github.com/vueComponent/ant-design-vue) - Ant Design Of Vue 实现
- JavaScript框架：Vue
- Jeecg-boot 的前段UI框架
- Vite
- node
- eslint
- Vite 8
- [@antv/g2plot](https://g2plot.antv.antgroup.com/) - AntV 图表（Vue 3 通过 `components/chart` 封装）
- [@antv/data-set](https://github.com/antvis/data-set) - 图表数据转换（fold / percent 等）



项目运行
----

- 安装nodeJS
```
建议安装 node-v20.20.2 或更高版本，Vite 8 要求 Node 20.19+ 或 22.12+
```

- 配镜像源（速度快）
```
npm config set registry https://registry.npmmirror.com
```

- 安装依赖
```
npm install
```

- 开发模式运行
```
npm run serve
```

- 编译发布项目
```
npm run build
```


其他说明
----

- 项目使用 [Vite](https://vite.dev/guide/) 构建，配置入口为 `vite.config.js`

- 关闭 Eslint (不推荐) 移除 `package.json` 中 `eslintConfig` 整个节点代码

- 修改 Ant Design 配色，在文件 `vite.config.js` 的 `css.preprocessorOptions.less.modifyVars` 中维护
```ecmascript 6
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1890FF',
          'link-color': '#1890FF',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    }
  }
```



附属文档
----
- [Ant Design Vue](https://vuecomponent.github.io/ant-design-vue/docs/vue/introduce-cn)

- [G2Plot 图表示例](https://g2plot.antv.antgroup.com/examples)

- [Vue](https://cn.vuejs.org/guide/introduction.html)

- [路由/菜单说明](https://github.com/zhangdaiscott/jeecg-boot/tree/master/ant-design-jeecg-vue/src/router/README.md)

- [ANTD 默认配置项](https://github.com/zhangdaiscott/jeecg-boot/tree/master/ant-design-jeecg-vue/src/defaultSettings.js)

- 其他待补充...


备注
----

> 前端构建已迁移到 Vite，后续如继续收敛 ESLint 规则，需要逐个验证现有 .vue 文件。
