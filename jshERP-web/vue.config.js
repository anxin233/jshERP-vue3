const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')

function resolve (dir) {
    return path.join(__dirname, dir)
}

// vue.config.js
// 子路径部署示例：VUE_APP_PUBLIC_PATH=/erp/（须以 / 开头和结尾）
module.exports = {
    publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    productionSourceMap: false,
    configureWebpack: config => {
        config.resolve = config.resolve || {}
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            // 覆盖相对路径 ./SubPopupMenu（Menu.js / SubMenu.js）与包路径两种解析方式
        }
        config.resolve.fallback = {
            ...(config.resolve.fallback || {}),
            timers: require.resolve('timers-browserify')
        }
    // 生产环境取消 console.log
        if (process.env.NODE_ENV === 'production') {
            const minimizers = config.optimization && config.optimization.minimizer
            if (Array.isArray(minimizers)) {
                minimizers.forEach(minimizer => {
                    if (minimizer && minimizer.options) {
                        minimizer.options.terserOptions = minimizer.options.terserOptions || {}
                        minimizer.options.terserOptions.compress = {
                            ...(minimizer.options.terserOptions.compress || {}),
                            drop_console: true
                        }
                    }
                })
            }
        }
    },
    chainWebpack: (config) => {
        config.resolve.alias
            .set('vue', '@vue/compat')
            .set('@$', resolve('src'))
            .set('@api', resolve('src/api'))
            .set('@assets', resolve('src/assets'))
            .set('@comp', resolve('src/components'))
            .set('@views', resolve('src/views'))
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => ({
                ...options,
                compilerOptions: {
                    ...(options.compilerOptions || {}),
                    compatConfig: {
                        MODE: 2,
                        COMPONENT_ASYNC: false
                    }
                }
            }))
        // 生产环境，开启js\css压缩
        if (process.env.NODE_ENV === 'production') {
            config.plugin('compressionPlugin').use(new CompressionPlugin({
                test: /\.(js|css|less)$/, // 匹配文件名
                threshold: 10240, // 对超过10k的数据压缩
                deleteOriginalAssets: false // 删除源文件
            }))
        }
    },
    css: {
        loaderOptions: {
            css: {
                url: {
                    filter: url => !url.startsWith('/static/')
                }
            },
            less: {
                lessOptions: {
                    modifyVars: {
                    /* less 变量覆盖，用于自定义 ant design 主题 */
                    'primary-color': '#1890FF',
                    'link-color': '#1890FF',
                        'border-radius-base': '4px',
                        'font-size-base': '14px',
                        'font-size-lg': '16px',
                        'text-color-secondary': 'rgba(0, 0, 0, 0.45)',
                        'heading-color': 'rgba(0, 0, 0, 0.85)',
                        'red-6': '#f5222d',
                        'green-6': '#52c41a',
                        'avatar-size-base': '32px',
                        'avatar-size-lg': '40px',
                        'avatar-size-sm': '24px'
                    },
                    javascriptEnabled: true,
                    math: 'always'
                }
            }
        }
    },
    devServer: {
        port: 3000,
        proxy: {
            '/erp/jshERP-boot': {
                target: 'http://localhost:9999', // 支持 /erp 子路径访问
                ws: false,
                changeOrigin: true,
                pathRewrite: {
                    '^/erp': '' // 去掉 /erp 前缀，转发到后端
                }
            },
            '/jshERP-boot': {
                target: 'http://localhost:9999', // 请求本地 需要jshERP-boot后台项目
                ws: false,
                changeOrigin: true
            }
        }
    },
    lintOnSave: undefined
}
