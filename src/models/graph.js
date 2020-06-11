import { graphData, defaultConfig, testData } from './mock';
import * as Tool from '../utils/tool';
import * as Service from '../services/request';

const processData = (data) => {
  return {
    ...data,
    nodes: Tool.removeDuplicateNodes(data.nodes)
  };
}

export default {

  namespace: 'graph',

  state: {
    raw: processData(graphData), // 返回的初始数据
    data: processData(graphData), // 图谱展示的数据
    config: defaultConfig, // 配置选项
    layout: 0, // 布局类型,初始为力导向图
    centerNode: Tool.findCenterNode(graphData), // 中心节点
    selectedNode: Tool.findCenterNode(graphData), // 选中节点的信息（初始为中心点）
    focusNode: undefined, // 聚焦/定位的节点（居中）
    layer: -1, // 显示层数(number)
    searchRecord: [], // 搜索记录（最近4条）
  },

  effects: {
    *queryData({ payload }, { call, put }) {  // eslint-disable-line
      console.log("effects: querydata", payload);
      const data = yield call(Service.searchKG, payload);
      console.log(data);
      if(data) {
        const graphData = processData(data);
        yield put({ type: 'initData', payload: graphData});
        yield put({ type: 'saveData', payload: graphData});
        yield put({ type: 'setSelectedNode', payload: data.nodes[0]});
      }
    },
  },

  reducers: {
    initData(state, { payload }) {
      return { ...state, raw: payload };
    },
    saveData(state, { payload }) {
      return { ...state, data: payload };
    },
    setLayout(state, { payload }) {
      return { ...state, layout: payload };
    },
    setSelectedNode(state, { payload }) {
      return { ...state, selectedNode: payload };
    },
    setFocusNode(state, { payload }) {
      return { ...state, focusNode: payload };
    },
    setLayer(state, { payload }) {
      return { ...state, layer: payload };
    },
    filterData(state, { payload }) {
      const newData = Tool.filterData(state.raw, payload.entityList, payload.relationList);
      return { ...state, data: newData };
    },
    resetData(state, { payload }) {
      return { ...state, data: state.raw };
    },
  },

};
