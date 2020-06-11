import React, {useEffect, useState} from 'react';
import { connect } from 'dva';
import * as d3 from 'd3';
import { message } from 'antd';
import Graph from './Graph';
import { buildTree, mapNodeIndex } from '../../utils/tool';
import TreeGraph from './TreeGraph';


const KnowledgeGraph = (props) => {
  const { data, config, layout, layer, focusNode } = props;

  const [treeRoot, setTreeRoot] = useState(null);
  const [graphData, setGraphData] = useState();

  // useEffect(() => {
  //   console.log("form tree data...", data);
  //   if(!data || data.nodes.length === 0) {
  //     message.warning('图谱数据为空');
  //   }
  //   formTree(data);
  // }, [data]);

  useEffect(() => {
    console.log(`layout:${layout}, layer:${layer}`);
    const nestedData = formTree(data);
    const root = d3.hierarchy(nestedData);
    setTreeRoot(root);
    formData(data, root, layer, layout);
  }, [data, layout, layer]);

  const formTree = (data) => {
    if(!data) return;
    const centerNode = data.nodes[0];
    const treeData = buildTree(data, centerNode);
    return treeData;
    // const root = d3.hierarchy(treeData);
    // setTreeRoot(root);
  }
  
  const changeLayout = (root, layout) => {
    // if(layout === 0) return root;
    const _root = Object.create(root);
    if(layout === 1) {
      const treeLayout = d3.tree().size([1000, 450]); // 树宽、树高
      treeLayout(_root);
    } else if(layout === 2) {
      const circularLayout = d3.tree().size([360, 400]); // x-360角度；y-最大半径
      circularLayout(_root);
    }
    return _root;
  }

  const formData = (data, root, layer, layout) => {
    if(!data) return;
    // const layoutRoot = changeLayout(root, layout);
    if(layout === 1) {
      const treeLayout = d3.tree().size([1000, 450]); // 树宽、树高
      treeLayout(root);
    } else if(layout === 2) {
      const circularLayout = d3.tree().size([360, 400]); // x-360角度；y-最大半径
      circularLayout(root);
    }
    
    const nodes = (layer === -1) ? 
    root.descendants() : root.descendants().filter(d => d.depth <= layer);
    
    console.log("展示节点数:", nodes.length);
    const nodeMap = {}; // nodeId : arrayIndex
    for(let i=0; i<nodes.length; i++) {
      nodeMap[nodes[i].data.id] = i;
    }
    const links = [];
    for(let link of data.links) {
      const sourceNode = nodes[nodeMap[link.source]];
      const targetNode = nodes[nodeMap[link.target]];
      if(sourceNode && targetNode) {
        links.push({
          ...link,
          source: sourceNode,
          target: targetNode,
        })
      }
    }
    setGraphData({ nodes, links });
  }
  
  // 展开或折叠节点
  const expandNode = (root, node) => {
    const target = root.descendants().find(item => item.data.id === node);
    if(target) {
      if(target.children) {
        target._children = target.children;
        target.children = null;
      } else {
        target.children = target._children;
        target._children = null;
      }
    }
    
    formData(data, root, layer); //若展开节点后超过设定层数，不显示？
  }
  
  return (
    graphData ? 
      <TreeGraph
        raw={data}
        root={treeRoot}
        data={graphData}
        center={data.nodes[0]}
        layout={layout}
        focusNode={focusNode}
        expandNode={expandNode}
        {...config} 
      /> : []
    // <Graph data={data} layout={layout} center={data.nodes[0]} {...config} />
  )
}

export default connect(({graph}) => ({
  data: graph.data,
  config: graph.config,
  layout: graph.layout,
  layer: graph.layer,
  focusNode: graph.focusNode
}))(KnowledgeGraph);