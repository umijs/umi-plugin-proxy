'use strict';

const api = require('fie-api');
const AnyProxy = require('anyproxy');
const argv = require('yargs').help(false).argv;
const enable = require('./enable');
const disable = require('./disable');

const log = api.log('umi-plugin-static-proxy');
const config = api.config;

module.exports = async function (options) {
  try {
    let assetsCfg;

    if (!config.exist()) {
      // 不存在配置文件走默认
      assetsCfg = options.proxy || {};
    } else {
      assetsCfg = api.config.get('proxy') || {};
    }

    const commonCfg = assetsCfg.common || {};
    const defaultOptions = {
      on: true,
      port: 8001,
      webInterface: {
        enable: true,
        webPort: 8002,
        wsPort: 8003,
      },
      forceProxyHttps: true,
      dangerouslyIgnoreUnauthorized: true,
      silent: true,
      https: true,
    };

    const serverOption = Object.assign({}, defaultOptions, commonCfg);

    serverOption.rule = require('./rule')(assetsCfg);

    const proxyServer = new AnyProxy.ProxyServer(serverOption);

    const isEnableSystemProxy = options.enable || false;

    if (isEnableSystemProxy) {
      enable(options || {});
    }

    proxyServer.on('ready', () => {
      log.success('proxy server start : http://127.0.0.1:8002');
    });

    proxyServer.on('error', (e) => {
      if (process.env.FIE_PROSY_SYSTEM) {
        disable();
      }
      console.log('proxy error');
      console.log(e);
    });

    // ctrl + c
    process.on('SIGINT', () => {
      // 若设置了全局代理，则需要清除
      if (process.env.FIE_PROSY_SYSTEM) {
        disable();
      }
      proxyServer.close();
      process.exit();
    });

    // close terminal
    process.on('SIGHUP', () => {
      // 若设置了全局代理，则需要清除
      if (process.env.FIE_PROSY_SYSTEM) {
        disable();
      }
      proxyServer.close();
      process.exit();
    });

    proxyServer.start();
  } catch (e) {
    throw e
  }

};
