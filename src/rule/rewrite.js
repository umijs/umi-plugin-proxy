const url = require('url');
const fs = require('fs-extra');
const api = require('fie-api');
const mime = require('mime-types');


const log = api.log('umi-plugin-staitc-proxy');
const logPrefix = '[rewrite]';

/**
 * match url
 * @param {String} requestUrl
 * @param {Array} ruleOptions
 */
const matchRule = function (requestUrl, ruleOptions) {
  let matchRes;
  ruleOptions.forEach((item) => {
    const match = requestUrl.match(item.rule);
    if (match && match[0]) {
      const destUrl = match[0].replace(item.rule, item.dest);
      matchRes = {
        match,
        destUrl
      };
    }
  });
  return matchRes;
};

/**
 * local path or url
 */
const isUrl = function (path) {
  return path.indexOf('http') === 0;
};

module.exports = {
  * beforeSendRequest(requestDetail, ruleOptions) {
    const requestUrl = requestDetail.url;
    const newRequestOptions = requestDetail.requestOptions;
    if (!ruleOptions || !ruleOptions.length) {
      return;
    }

    const matchRes = matchRule(requestUrl, ruleOptions);

    const match = matchRes && matchRes.match;
    const destUrl = matchRes && matchRes.destUrl;
    if (match && match[0]) {
      if (isUrl(destUrl)) {
        // map remote
        const destUrlObj = url.parse(destUrl);
        newRequestOptions.hostname = destUrlObj.hostname;
        newRequestOptions.port = destUrlObj.port;
        newRequestOptions.path = destUrlObj.path;

        return {
          protocol: destUrlObj.protocol,
          requestOptions: newRequestOptions
        };
      }
      // map local
      const filePath = destUrl.replace('~', process.env.HOME);
      if (!fs.pathExistsSync(filePath)) {
        log.error(logPrefix, ' file not found : ', filePath);
        return null;
      }

      const fileContent = fs.readFileSync(filePath).toString();
      const mimeType = mime.lookup(filePath) || 'text/plain';
      const localResponse = {
        statusCode: 200,
        header: {
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*'
        },
        body: fileContent
      };

      return {
        response: localResponse
      };
    }
  },
  * beforeSendResponse(requestDetail, responseDetail, ruleOptions) {
    if (!ruleOptions || !ruleOptions.length) {
      return;
    }
    const matchRes = matchRule(requestDetail.url, ruleOptions);
    const match = matchRes && matchRes.match;
    if (match && match[0]) {
      const newResponse = responseDetail.response;
      newResponse.header['X-Proxy-By'] = 'AnyProxy';
      newResponse.header['Access-Control-Allow-Origin'] = '*';
      return {
        response: newResponse
      };
    }
  }
};
