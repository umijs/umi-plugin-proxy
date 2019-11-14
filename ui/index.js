import { Button } from 'antd';

export default (api) => {
  const { callRemote } = api;

  function PluginPanel() {
    return (
      <div style={{ padding: 20 }}>
        <span>这里之后增加可以更改代理的界面 TODO</span>
      </div>
    );
  }

  api.addPanel({
    title: 'umi-plugin-proxy',
    path: '/umi-plugin-proxy',
    icon: 'home',
    component: PluginPanel,
  });
}
