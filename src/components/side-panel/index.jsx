import React from 'react';
import { Tabs } from 'antd';
import DetailPanel from './DetailPanel';
import FilterPanel from './FilterPanel';
import ConfigPanel from './ConfigPanel';
import './style.less';

const { TabPane } = Tabs;


const SidePanel = () => {
  return (
    <div className="side-panel">
       <Tabs defaultActiveKey="1">
        <TabPane tab="知识卡片" key="1">
          <DetailPanel />
        </TabPane>
        <TabPane tab="筛选过滤" key="2">
          <FilterPanel />
        </TabPane>
        <TabPane tab="可视配置" key="3">
          <ConfigPanel />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default SidePanel;