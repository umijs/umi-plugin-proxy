// ref:
// - https://umijs.org/plugin/develop.html
const start = require('./start')
const disable = require('./disable')
const cert = require('./cert')

export default function (api, options) {

  api.onDevCompileDone(({ isFirstCompile, stats }) => {
    if (isFirstCompile) {
      start(options)
    }
  })

  // 需要等待umi添加退出的生命周期才可以添加 umi的版本需要
  api.onExit(() => {
    disable()
  })

  // 注册证书能力
  api.registerCommand('cert', {
    hide: true
  }, args => {
    cert()
  });

  api.addUIPlugin(require.resolve('../dist/index.umd'));

  api.onUISocket(({ action, failure, success }) => {
    if (action.type === 'org.自羽.umi-plugin-proxy.test') {
      success({
        data: 'umi-plugin-proxy.test',
      });
    }
  });

}
