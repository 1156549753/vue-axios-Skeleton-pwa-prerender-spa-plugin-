const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin');
module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: 'https://www.jthxsh.com'
            // proxy: {
            //   '/api': {
            //       target: 'https://uat.jthxsh.com',
            //       changeOrigin: true,
            //       pathRewrite: {
            //         '^/api': '/'   //需要rewrite的,
            //     } 
            //     }
            // }
    },
    pwa: {
        name: 'My App',
        themeColor: '#4DBA87',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
    
        // 配置 workbox 插件
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
          // InjectManifest 模式下 swSrc 是必填的。
          swSrc: 'src/sw.js',
          // ...其它 Workbox 选项...
        }
      },
    css: {
        loaderOptions: {
            postcss: {
                // 这是rem适配的配置  注意： remUnit在这里要根据lib-flexible的规则来配制，如果您的设计稿是750px的，用75就刚刚好。
                plugins: [
                    require("postcss-px2rem")({
                        remUnit: 75
                    })
                ]
            }
        },
        // 是否使用css分离插件 ExtractTextPlugin
        extract: true,
        // 开启 CSS source maps?
        sourceMap: false,
        // 启用 CSS modules for all css / pre-processor files.
        modules: false
    },
    configureWebpack:{ // 覆盖webpack默认配置的都在这里 
        resolve: { // 配置解析别名
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve(__dirname, './src'),
                '@h': path.resolve(__dirname, './src/assets/hotcss'),
                '@s': path.resolve(__dirname, './src/assets/style'),
                '@i': path.resolve(__dirname, './src/assets/images'),
            }
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            warnings: false,
                            drop_console: true, //console
                            drop_debugger: false,
                            pure_funcs: ['console.log'] //移除console
                        }
                    }
                })
            ]
        }
    },
    configureWebpack: (config) => {
        config.plugins.push(new SkeletonWebpackPlugin({
            webpackConfig: {
              entry: {
                app: path.join(__dirname, './src/skeleton.js'),
              },
            },
            minimize: true,
            quiet: true,
          }));
        if (process.env.NODE_ENV !== 'production') return;
        return {
          plugins: [
            new PrerenderSPAPlugin({
              // 生成文件的路径，也可以与webpakc打包的一致。
              // 下面这句话非常重要！！！
              // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，在预渲染的时候只会卡着不动。
              staticDir: path.join(__dirname, 'dist'),
      
              // 对应自己的路由文件，比如a有参数，就需要写成 /a/param1。
              routes: ['/', '/Login', '/Home'],
      
              // 这个很重要，如果没有配置这段，也不会进行预编译
              renderer: new Renderer({
                inject: {
                  foo: 'bar'
                },
                headless: false,
                // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
                renderAfterDocumentEvent: 'render-event'
              })
            })
          ]
        };
      },
}