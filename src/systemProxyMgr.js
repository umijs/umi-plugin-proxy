'use strict';
const os = require('os');
const child_process = require('child_process');

const networkTypes = ['Ethernet', 'Thunderbolt Ethernet', 'Wi-Fi'];

function execSync(cmd) {
  let stdout,
    status = 0;
  try {
    stdout = child_process.execSync(cmd);
  } catch (err) {
    stdout = err.stdout;
    status = err.status;
  }

  return {
    stdout: stdout.toString(),
    status
  };
}

/**
 * proxy for CentOs
 * ------------------------------------------------------------------------
 *
 * file: ~/.bash_profile
 *
 * http_proxy=http://proxy_server_address:port
 * export no_proxy=localhost,127.0.0.1,192.168.0.34
 * export http_proxy
 * ------------------------------------------------------------------------
 */

/**
 * proxy for Ubuntu
 * ------------------------------------------------------------------------
 *
 * file: /etc/environment
 * more info: http://askubuntu.com/questions/150210/how-do-i-set-systemwide-proxy-servers-in-xubuntu-lubuntu-or-ubuntu-studio
 *
 * http_proxy=http://proxy_server_address:port
 * export no_proxy=localhost,127.0.0.1,192.168.0.34
 * export http_proxy
 * ------------------------------------------------------------------------
 */

/**
 * ------------------------------------------------------------------------
 * mac proxy manager
 * ------------------------------------------------------------------------
 */

const defaultPassdomain = [
  '127.0.0.1',
  '*:8088',
  '[::1]',
  'localhost',
  "*.alikunlun.com",
  "*.alipay-corp.com",
  "*.alipay-inc.com",
  '*.alip*.*',
  '*.alibaba*.*',
  "*.alipay.net",
  "*.alipayobjects.com",
  "*.alitrip.com",
  '*.aliway.*',
  "*.aliyun-inc.com",
  '*.aliy*.*',
  "*.alizoo.com",
  "*.amap.com",
  "*.antfinancial-corp.com",
  "*.antsdaq-corp.com",
  "*.anyproxy.io",
  "*.atatech.org",
  "*.baidu.com",
  "*.cainiao-inc.com",
  "*.cnzz.com",
  "*.dingtalk.com",
  "*.koubei-corp.com",
  "*.mayibank.net",
  "*.mmstat.com",
  "*.mybank-corp.cn",
  "*.qq.com",
  // "*.taobao.com",
  "*.taobao.org",
  "*.tbsite.net",
  "*.tmall.net",
  "*.weiyun.com",
  "*.yunos-inc.com",
  "*.yunos.com",
  "*.zmxy-corp.com.cn",
  "*alipayobjects.com",
  '10.*.*.*',
  '30.*.*.*',
  "cloudprinter-hz.taobao.ali.com",
  "*.weibo.com",
  "*.atatech.org",
  "*.huaban.com",
  'img.alicdn.com',
  'laz-img-cdn.alicdn.com',
  '*.g*.*',
  '*.b*.*',
  '*.c*.*',
  '*.e*.*',
  '*.f*.*',
  '*.h*.*',
  '*.i*.*',
  '*.j*.*',
  '*.k*.*',
  '*.l*.*',
  '*.m*.*',
  '*.n*.*',
  '*.o*.*',
  '*.p*.*',
  '*.q*.*',
  '*.r*.*',
  '*.s*.*',
  '*.u*.*',
  '*.v*.*',
  '*.w*.*',
  '*.x*.*',
  '*.y*.*',
  '*.z*.*'
].join(' ');

const macProxyManager = {};

macProxyManager.getNetworkType = () => {
  for (let i = 0; i < networkTypes.length; i++) {
    const type = networkTypes[i],
      result = execSync('networksetup -getwebproxy ' + type);

    if (result.status === 0) {
      macProxyManager.networkType = type;
      return type;
    }
  }

  throw new Error('Unknown network type');
};


macProxyManager.enableGlobalProxy = (ip, port, proxyType, passdomain) => {
  if (!ip || !port) {
    console.log('failed to set global proxy server.\n ip and port are required.');
    return;
  }

  proxyType = proxyType || 'http';
  passdomain = passdomain || defaultPassdomain;

  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType();

  return /^http$/i.test(proxyType) ?

    // set http proxy
    execSync(
      'sudo networksetup -setwebproxy ${networkType} ${ip} ${port} && sudo networksetup -setproxybypassdomains ${networkType} ${passdomain}'
        .replace(/\${networkType}/g, networkType)
        .replace('${ip}', ip)
        .replace('${passdomain}', passdomain)
        .replace('${port}', port)) :

    // set https proxy
    execSync('sudo networksetup -setsecurewebproxy ${networkType} ${ip} ${port} && sudo networksetup -setproxybypassdomains ${networkType} ${passdomain}'
      .replace(/\${networkType}/g, networkType)
      .replace('${ip}', ip)
      .replace('${passdomain}', passdomain)
      .replace('${port}', port));
};

macProxyManager.disableGlobalProxy = (proxyType) => {
  proxyType = proxyType || 'http';
  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType();
  return /^http$/i.test(proxyType) ?

    // set http proxy
    execSync(
      'sudo networksetup -setwebproxystate ${networkType} off'
        .replace('${networkType}', networkType)) :

    // set https proxy
    execSync(
      'sudo networksetup -setsecurewebproxystate ${networkType} off'
        .replace('${networkType}', networkType));
};

macProxyManager.getProxyState = () => {
  const networkType = macProxyManager.networkType || macProxyManager.getNetworkType();
  const result = execSync('sudo networksetup -getwebproxy ${networkType}'.replace('${networkType}', networkType));

  return result;
};

/**
 * ------------------------------------------------------------------------
 * windows proxy manager
 *
 * netsh does not alter the settings for IE
 * ------------------------------------------------------------------------
 */

const winProxyManager = {};

winProxyManager.enableGlobalProxy = (ip, port) => {
  if (!ip && !port) {
    console.log('failed to set global proxy server.\n ip and port are required.');
    return;
  }

  return execSync(
    // set proxy
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${ip}:${port} /f & '
      .replace('${ip}', ip)
      .replace('${port}', port) +

    // enable proxy
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f');
};

winProxyManager.disableGlobalProxy = () => execSync('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f');

winProxyManager.getProxyState = () => ''

winProxyManager.getNetworkType = () => ''

module.exports = /microsoft/.test(os.release().toLocaleLowerCase()) ? winProxyManager : macProxyManager;
