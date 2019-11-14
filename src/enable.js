'use strict';

const spawn = require('cross-spawn');
const api = require('fie-api');
const systemProxy = require('./systemProxyMgr');
const sudo = require('./sudo');

const log = api.log('umi-plugin-static-proxy');
const config = api.config;

module.exports = function (options = {}) {
  let assetsCfg;
  // 代理白名单
  let passdomain = null;
  if (!config.exist()) {
    // 不存在配置文件走默认
    assetsCfg = options.proxy || {};
  } else {
    assetsCfg = api.config.get('proxy') || options.proxy || {};
  }

  const commonCfg = assetsCfg.common || {};
  // 默认 8001 端口，与start一致
  const defaultOptions = {
    port: 8001,
    host: '127.0.0.1'
  };

  if (assetsCfg.passdomain) {
    passdomain = assetsCfg.passdomain;
  }

  const serverOption = Object.assign({}, defaultOptions, commonCfg);

  // check 一下 是否需要sudo权限
  const checkResult = spawn.sync('sudo', ['-A', 'networksetup', '-version']);
  // 说明要开sudo权限
  log.debug(`sudo -A check networksetup , status = ${checkResult.status}`);
  if (checkResult.status !== 0) {
    sudo();
  }

  // const result_http = systemProxy.enableGlobalProxy(serverOption.host, serverOption.port, 'http', passdomain);
  const result_https = systemProxy.enableGlobalProxy(serverOption.host, serverOption.port, 'https', passdomain);
  if (result_https.status === 0) {
    process.env.FIE_PROSY_SYSTEM = true;
    // success
    log.success(`Successfully enable system web proxy for ${serverOption.host}:${serverOption.port} !`);
  } else {
    log.error(result_https);
    // log.error(result_https);
  }
};
