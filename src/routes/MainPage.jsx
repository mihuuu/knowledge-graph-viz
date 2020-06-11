import React, { useState } from 'react';
import {  Layout } from 'antd';
import KnowledgeGraph from '../components/graph';
import SidePanel from '../components/side-panel';
import AppHeader from '../components/Header';
import './style.less';

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      <Layout className="site-layout">
        <Header className="header-bar">
          <AppHeader toggleHook={[collapsed, toggleSider]} />
              
        </Header>
        <Content className="content">
          <KnowledgeGraph />
        </Content>
      </Layout>
      <Sider className="side-bar" width={300} collapsedWidth={6}
        trigger={null} collapsible collapsed={collapsed}>
        {/* <div className="logo" /> */}
        <SidePanel />
      </Sider>
    </Layout>
  );
}

export default App;
