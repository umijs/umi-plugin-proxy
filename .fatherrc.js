
export default [
  {
    cjs: 'babel',
  },
  {
    entry: 'ui/index.js',
    umd: {
      name: 'umi-plugin-proxy',
      minFile: false,
    },
  },
];
