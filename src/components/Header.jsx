import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Input, Select, Button, Popover } from 'antd';
import { AimOutlined, ReloadOutlined, MenuUnfoldOutlined,
  MenuFoldOutlined } from '@ant-design/icons';
import './style.less';
import { Layout } from '../models/constant';

const { Search } = Input;
const { Option } = Select;

// 节点定位组件
const locateEntity = (data, dispatch) => {
  const [resultList, setResultList] = useState([]);
  const [value, setValue] = useState();
  
  // 查询节点（实体名称包含用户输入内容）
  const searchEntity = (input) => {
    let res = data.nodes.filter(d => d.name.includes(input));
    if(res.length > 5) {
      res = res.slice(0, 5); // 取前 5 条
    }
    setResultList(res);
  }

  const selectItem = (value) => {
    setValue(value);
    dispatch({
      type: "graph/setFocusNode",
      payload: value
    })
  }

  return <Select
    showSearch
    allowClear
    value={value}
    placeholder="搜索实体名称..."
    style={{ width: 200 }}
    defaultActiveFirstOption={false}
    showArrow={false}
    filterOption={false}
    onSearch={searchEntity}
    onChange={selectItem}
    notFoundContent={null}
  >
    {resultList.map(d => <Option key={d.id}>{d.name}</Option>)}
  </Select>
}

const AppHeader = (props) => {
  const { dispatch, toggleHook, data, layout, layer } = props;
  const [collapsed, toggleSider] = toggleHook;

  const handleSearch = (value) => {
    console.log("search: ", value);
    dispatch({
      type: "graph/queryData",
      payload: value
    })
  }

  const changeLayout = (value) => {
    dispatch({
      type: "graph/setLayout",
      payload: value
    })
  }

  const changeLayer = (value) => {
    dispatch({
      type: "graph/setLayer",
      payload: value
    })
  }

  const resetLayout = () => {
    dispatch({
      type: "graph/resetData",
    })
    dispatch({
      type: "graph/setLayer",
      payload: -1
    })
    dispatch({
      type: "graph/setLayout",
      payload: 0
    })
  }

  return (
    <>
      <div className="logo-title">
        <svg t="1588144544886" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1125" width="64" height="64"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#B6CCF9" p-id="1126"></path><path d="M513.20832 545.7408L335.84128 658.61632a71.68 71.68 0 1 1-20.81792-35.29728L477.2352 520.0896 317.66528 388.27008a81.92 81.92 0 1 1 29.24544-28.96896l156.73344 129.47456 113.3056-193.30048a76.8 76.8 0 1 1 35.84 19.8656L537.46688 512.07168l192.4608 96.23552a81.92 81.92 0 1 1-20.45952 35.56352l-196.25984-98.12992zM512 849.92a61.44 61.44 0 1 1 0-122.88 61.44 61.44 0 0 1 0 122.88z" fill="#79A0EE" p-id="1127"></path><path d="M506.88 527.36m-128 0a128 128 0 1 0 256 0 128 128 0 1 0-256 0Z" fill="#4577D8" p-id="1128"></path></svg>
        <span>产业知识图谱</span>
      </div>
      <div className="row-item">
        <Search
          placeholder="请输入搜索内容"
          onSearch={handleSearch}
          style={{ width: 250 }}
        />
      </div>
      <div className="row-item">
        <span>更改布局：</span>
        <Select
          defaultValue={Layout.Force}
          value={layout}
          style={{ width: 130 }}
          onChange={changeLayout}
        >
          <Option value={Layout.Force}>力导向图</Option>
          <Option value={Layout.Tree}>树状图</Option>
          <Option value={Layout.Circle}>环形图</Option>
        </Select>
      </div>
      <div className="row-item">
        <span>显示层数：</span>
        <Select
          defaultValue={-1}
          value={layer}
          style={{ width: 80 }}
          onChange={changeLayer}
        >
          <Option value={-1}>全部</Option>
          <Option value={1}>1层</Option>
          <Option value={2}>2层</Option>
          <Option value={3}>3层</Option>
        </Select>
      </div>
      <div className="row-item">
        <Popover placement="bottom" content={locateEntity(data, dispatch)} trigger="click">
          <Button icon={<AimOutlined />}>
            节点定位
          </Button>
        </Popover>
       </div> 
      <div className="row-item">
        <Button icon={<ReloadOutlined />} onClick={resetLayout}>
          重置布局
        </Button>
      </div>
      <div className="row-item trigger">
        {React.createElement(collapsed ? MenuFoldOutlined : MenuUnfoldOutlined, {
          onClick: toggleSider
        })}
      </div>
    </>
  )

}

export default connect(({graph}) => ({
  data: graph.data,
  layout: graph.layout,
  layer: graph.layer
}))(AppHeader);