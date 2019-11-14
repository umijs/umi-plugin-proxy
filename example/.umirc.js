import { join } from 'path';

export default {
  routes: [
    { path: '/', component: './index' },
  ],
  plugins: [
    [join(__dirname, '..', require('../package').main || 'index.js'), {
      enable: true,
      proxy: {
        rewrite: [{
          rule: /tpi\/topbar\/([\d\.]*)\/(.*).js/,
          dest: 'https://127.0.0.1:7000/$2.js'
        }, {
          rule: /tpi\/topbar\/([\d\.]*)\/(.*)\.css/,
          dest: 'https://127.0.0.1:7000/umi.css'
        }]
      }
    }],
  ],
}
