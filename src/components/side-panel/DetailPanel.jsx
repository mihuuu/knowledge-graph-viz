import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Divider, Descriptions, Tag, Collapse, Timeline } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { ENTITY_GROUP } from '../../models/constant';
import { sortEvents } from '../../utils/tool';
import './style.less';

const { Panel } = Collapse;

const getCompanyInfo = (info) => {
  const displayInfo = [];
  const location = `${info['省份']} / ${info['城市']} / ${info['区']}`;
  const keys = ['企业全名', '省份/城市/区', '地址', '法人', '注册资本', '成立时间', '网址'];
  for(let key of keys) {
    if(key === '省份/城市/区') {
      displayInfo.push({ key, value: location});
    } else {
      displayInfo.push({ key, value: info[key]});
    }
  }
  return displayInfo;
}

const companyKeys = ['企业全名', '省份', '城市', '区', '地址', '法人', '注册资本', '成立时间', '网址'];
const productKeys = ['发布时间', '用途'];
const investEventKeys = ['融资时间', '融资轮次', '融资金额'];

const getInfo = (data, type) => {
  switch(type) {
    case 0:
      return companyKeys;
    case 1:
      return productKeys;
    case 3:
      return investEventKeys;
    default:
      return [];
  }
}

const DetailPanel = ({ raw, data }) => {
  const { id, name, group, info } = data;
  return (
    <>
      <h2>{name || '暂无'}
        <span style={{paddingLeft: '10px'}}>
          <Tag><TagOutlined style={{paddingRight: '5px'}}/>{ENTITY_GROUP[group+1]}</Tag>
        </span>
      </h2>
      <Divider style={{margin: '15px 0'}} />
      <Tag color="#fc7d3e" style={{marginBottom: '15px'}}>基本信息</Tag>
      { info ? <div>
      <Descriptions column={1}>
        {/* {getCompanyInfo(info).map(item => 
          <Descriptions.Item key={item.key} label={item.key}>{item.value || '无'}</Descriptions.Item>
        )} */}
        {getInfo(info, group).map(item => 
          <Descriptions.Item key={item} label={item}>{info[item] || '暂无'}</Descriptions.Item>
        )}
      </Descriptions>
      { id === raw.nodes[0].id && 
      <>
        <Tag color="#108ee9" style={{marginBottom: '15px'}}>投融资记录</Tag>
        <Timeline mode="left">
          {sortEvents(raw).map(({id, info}) => 
            <Timeline.Item key={id} >
              <p>{info['融资时间']}</p>
              <p>融资轮次：{info['融资轮次']}</p>
              <p>融资金额：{info['融资金额']}</p>
            </Timeline.Item>
          )}
        </Timeline>
      </>
      }
      </div>
      : <h4>暂无信息</h4> }
    </>
  )
}

export default connect(({graph}) => ({
  raw: graph.raw,
  data: graph.selectedNode
}))(DetailPanel);