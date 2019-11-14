/**
 * 生成anyproxy证书
 */

const spawn = require('cross-spawn');
const mkcert = require('mkcert-prebuilt-cdn');


module.exports = async function () {
  await spawn(mkcert, ['-install']); 
  await spawn(mkcert, ['localhost','127.0.0.1','::1']); 

  await spawn(require.resolve('anyproxy/bin/anyproxy-ca'), { stdio: 'inherit' });
  console.log('证书安装完成')
};
