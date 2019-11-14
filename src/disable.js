'use strict';

const api = require('fie-api');
const systemProxy = require('./systemProxyMgr');

const log = api.log('umi-plugin-static-proxy');

module.exports = function () {
  // const result = systemProxy.disableGlobalProxy();
  const result_https = systemProxy.disableGlobalProxy('https');
  if (result_https.status === 0) {
    // success
    log.success('Successfully clean system web proxy setting !');
  } else {
    log.error(result_https);
    // log.error(result_https);
  }
};
