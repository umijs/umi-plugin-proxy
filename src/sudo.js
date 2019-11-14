'use strict';

const childProcess = require('child_process');
const api = require('fie-api');

const log = api.log('umi-plugin-static-proxy');

function execSync(cmd) {
  let stdout;
  let status = 0;
  try {
    stdout = childProcess.execSync(cmd);
  } catch (err) {
    stdout = err.stdout;
    status = err.status;
  }

  return {
    stdout: stdout.toString(),
    status
  };
}

module.exports = function () {
  const result = execSync('sudo bash -c \'echo "$(logname) ALL=(root) NOPASSWD: /usr/sbin/networksetup" | (EDITOR="tee -a" visudo)\'\n');
  if (result.status === 0) {
    // success
    log.success('Execute sudo without Password for networksetup command , success!');
  } else {
    log.error(result);
  }
};
