import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { connect } from 'dva';
import { Menu } from 'antd';
import { SelectOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import './style.css';
import * as Tool from '../../utils/tool';
import { Layout } from '../../models/constant';

function drag(simulation) {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

function setElementPosition(nodes, links) {
  d3.selectAll(".node-circle").data(nodes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    d3.selectAll(".node-text").data(nodes)
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    d3.selectAll(".link-line").data(links)
        .attr("x1", d => d.source && d.source.x)
        .attr("y1", d => d.source && d.source.y)
        .attr("x2", d => d.target && d.target.x)
        .attr("y2", d => d.target && d.target.y);
    
    d3.selectAll(".link-label").data(links)
      .attr("x", d => d.x)
      .attr("y", d => d.y);

    d3.selectAll(".link-path").data(links)
      .attr("d", d => `M ${d.source && d.source.x} ${d.source && d.source.y} L${d.target && d.target.x} ${d.target && d.target.y}`);
}

const Graph = (props) => {
  const { dispatch, data, layout, center, entityGroup, colorRange, graphConfig } = props;
  const { svgWidth, svgHeight, linkDistance, chargeStrength, highlightColor, nodeSize, linkColor, linkTextSize, nodeTextSize } = graphConfig;
  const colorScale = d3.scaleOrdinal() //=d3.scaleOrdinal(d3.schemeSet2)
    .domain(entityGroup)
    .range(colorRange);

  const [displayNodes, setDisplayNodes] = useState(data.nodes);
  const [displayLinks, setDisplayLinks] = useState(data.links);
  const [selectedNode, setSelectedNode] = useState(null); // 选中的节点
  const [operateNode, setOperateNode] = useState(null); // 右键点击的节点
  const [relatedLinks, setRelatedLinks] = useState([]); // 相关的链接

  useEffect(() => {
    initGraph();
  }, [])

  useEffect(() => {
    setSelectedNode(null);
    console.log("re-render")
    drawGraph(data, layout);
    // drawTreeGraph(data);
    // drawForceGraph(data, graphConfig);
  }, [data, graphConfig, layout]);

  const initGraph = () => {
    // 视图缩放
    const zoomed = () => {
      d3.select("#svg-container").attr("transform", d3.event.transform);
    }

    d3.select("#svg-graph").call(d3.zoom()
        // .extent([[0, 0], [svgWidth, svgHeight]])
        .scaleExtent([0.7, 3])
        .on("zoom", zoomed));
  }

  // 绘制力导向图
  const drawForceGraph = (data) => {
    const { nodes, links } = data;
    // 直接取值的话，会改变原来的data
    console.log("drawing force graph: ", data);
    
    const simulation = d3.forceSimulation(nodes)
      // .alpha(0.3).alphaMin(0.001).alphaDecay(0.028)
      // .force("collisionForce", d3.forceCollide(10).strength(1))
      .force("link", d3.forceLink(links).id(d => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));
      // 此函数之后data.links 从 Link 变为 joinedLink 格式

      simulation.on("tick", () => setElementPosition(nodes, links));

      // 节点拖拽
      d3.selectAll(".node-circle").call(drag(simulation));
    }

  // 绘制树状图
  const drawTreeGraph = (data) => {
    // const links = data.links.map(d => Object.create(d));
    // const nodes = data.nodes.map(d => Object.create(d));
    // 如果去掉该段，数据是 Link 不是 joinedLink，后面buildTree失效
    // const simulation = d3.forceSimulation(data.nodes)
    //   .force("link", d3.forceLink(data.links).id(d => d.id));

    const centerNode = data.nodes.find(d => d.group === 0);
    const treeData = Tool.buildTree(data, centerNode);
    console.log("tree ", treeData);
    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([800, 400]);
    treeLayout(root);
    console.log(data, root.descendants());
    // console.log(root.links());

    const { nodes, links } = Tool.sortTreeData(data, root.descendants());
    console.log({nodes, links});
    setElementPosition(nodes, links);
  }

  const drawGraph = (data, layout) => {
    console.log("graph layout: ", layout);
    if(layout === Layout.Force) {
      drawForceGraph(data);
    } else if(layout === Layout.Tree) {
      drawTreeGraph(data);
    }
  }

  const handleMouseOver = (e) => {
    // console.log(e.target.__data__);
    if(e.target.classList.contains("node-circle")) {
      if(selectedNode !== e.target.__data__.id) {
        e.target.classList.add("node-hover");
      }
      // console.log(e.target.__data__)
      // 节点的相邻链接高亮
      const neighbor = Tool.calcNeighborElements(data, e.target.__data__.id);
      setRelatedLinks(neighbor.links);

      // 淡化相邻节点/链接以外的其他元素
      // d3.selectAll(".link-line, .link-path, .link-label")
      //   .classed("hide-element", d => neighbor.links.indexOf(d.id) === -1);
      
      // d3.selectAll(".node-circle, .node-text")
      //   .classed("hide-element", d => neighbor.nodes.indexOf(d.id) === -1);
      

    } else if(e.target.classList.contains("link-line")) {
      setRelatedLinks([e.target.__data__.id]);
    }
  }

  const handleMouseOut = (e) => {
    if(e.target.nodeName === "circle") {
      e.target.classList.remove("node-hover");
    }
    d3.selectAll("circle, text, line")
      .classed("hide-element", false);
    
    setRelatedLinks([]);
  }

  const handleClick = (e) => {
    d3.select(".node-menu")
      .style("display", "none");
    
    // 设置探查层级
    if(e.target.nodeName === "circle") {
      const nodeId = e.target.__data__.id;
      console.log("clicked: ", e.target.__data__);
      dispatch({
        type: "graph/setSelectedNode",
        payload: e.target.__data__
      })
      setSelectedNode(nodeId);
    }
  }

  // 右键点击节点，显示菜单
  const handleRightClick = (e) => {
    e.preventDefault();
    if(e.target.nodeName === "circle") {
      d3.select(".node-menu")
      .style("display", "block")
      .style("box-shadow", "2px 2px 5px #aaa")
      .style("left", (e.pageX) + "px")
      .style("top", (e.pageY) + "px");

      const nodeId = e.target.__data__.id;
      setOperateNode(nodeId);
    }
  }

  // 点击菜单选项
  const handleMenuOperation = ({ key }) => {
    if(key === "1") {
      // 节点展开或折叠
      let isExpand = displayLinks.filter(
        d => d.source === operateNode).length === 0 ? true : false;
      const displayData = {
        nodes: displayNodes,
        links: displayLinks
      }
      const newData = Tool.expandOrToggleNode(data, displayData, operateNode, isExpand);
      // const newData = Tool.expandNextLayer(data, nodeId);
      console.log(newData);
      const nodeIdList = newData.nodes.map(d => d.id);
      const linkIdList = newData.links.map(d => d.id);
      
      if(isExpand) {
        setDisplayNodes([...displayNodes, ...newData.nodes]);
        setDisplayLinks([...displayNodes, ...newData.nodes]);
        // setDisplayData({
        //   nodes: [...displayData.nodes, ...newData.nodes],
        //   links: [...displayData.links, ...newData.links]
        // })
      } else {
        // setDisplayData({
        //   nodes: displayData.nodes.filter(d => nodeIdList.indexOf(d.id) === -1),
        //   links: displayData.links.filter(d => linkIdList.indexOf(d.id) === -1)
        // })
        // d3.selectAll(".node")
        //   .filter(function() { return nodeId.indexOf(d3.select(this).attr("id")) !== -1 } )
        //   .style("display", "none");

        d3.selectAll(".node-circle, .node-text")
          .filter(d => nodeIdList.indexOf(d.id) !== -1 )
          .transition().duration(800)
          .style("display", function(){
            return d3.select(this).style("display") === "none" ? null : "none"
          });
        
        d3.selectAll(".link-line, .link-path, .link-label")
          .filter(d => linkIdList.indexOf(d.id) !== -1 )
          .transition().duration(800)
          .style("display", function(){
            return d3.select(this).style("display") === "none" ? null : "none"
          });
      }
    }
    d3.select(".node-menu")
      .style("display", "none");
  }

  const getNodeColor = (item) => {
    return item.id === center.id ? colorScale('分析主体') : colorScale(entityGroup[item.group+1]);
  }

  return (
    <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="svg-graph"
      width="100%"
      height="100%"
      // cursor="move"
      // width={svgWidth}
      // height={svgHeight}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onContextMenu={handleRightClick}
    >
      <defs>
        <marker id="arrow-head" orient="auto"
          markerWidth='12' markerHeight='12'
          refX={nodeSize+10} refY='5'
        >
          <path d='M0,0 L10,5 L0,10 Z' fill="#999" stroke="none"/>
        </marker>
        <marker id='arrow-head-scale' orient="auto"
          markerWidth='12' markerHeight='12'
          refX={nodeSize-9} refY='3'
        >
          <path d='M0,0 L6,3 L0,6 Z' fill={highlightColor} stroke="none"/>
        </marker>
      </defs>
      <g id="svg-container">
        <g className="link-group">
          { data.links.map((item) => 
            <g key={item.id} className="link" id={`link-${item.id}`}>
              <line
                stroke={relatedLinks.indexOf(item.id) === -1 ? linkColor:highlightColor}
                strokeOpacity="0.6"
                strokeWidth={relatedLinks.indexOf(item.id) === -1 ? 1 : 2}
                // strokeWidth={Math.sqrt(item.weight)}
                markerEnd={relatedLinks.indexOf(item.id) === -1 ? "url(#arrow-head)" : "url(#arrow-head-scale)"}
                className="link-line"
                cursor="pointer"
                />
              <path fillOpacity="0" strokeOpacity="0" id={`linkpath-${item.id}`} className="link-path" pointerEvents="none"/>
              <text fontSize={linkTextSize} fill={linkColor} className="link-label" pointerEvents="none" dy="-5">
                <textPath xlinkHref={`#linkpath-${item.id}`} startOffset="50%" textAnchor="middle" >
                  {item.relation}
                </textPath>
              </text>
            </g>
          )}
        </g>
        <g className="node-group">
          { data.nodes.map((item) => 
            <g key={item.id} className="node" id={`node-${item.id}`}>
              <circle
                stroke="#fff"
                strokeWidth="1.5"
                r={nodeSize}
                fill={getNodeColor(item)}
                cursor="pointer"
                className={`node-circle ${selectedNode === item.id && "node-focus"}`}
                >
              </circle>
              <text
                fill="#000"
                fontSize={selectedNode === item.id ? nodeTextSize+2 : nodeTextSize}
                fontWeight={selectedNode === item.id ? 800 : 0}
                textAnchor="middle"
                alignmentBaseline="central"
                pointerEvents="none"
                className="node-text"
              >
                {item.name}
              </text>
            </g>
          )}
        </g>
      </g>
      <g id="legend-group">
        { entityGroup.map((item, i) => {
          console.log(item, i);
          return <g key={item} transform={`translate(40, ${svgHeight - 120 + i * 30})`}>
            <circle cx="0" cy="0" r="5" fill={colorScale(item)} />
            <text fontSize="14" x="15" y="5">{item}</text>
          </g>
        }
        )}
      </g>
    </svg>
    <Menu
      className="node-menu"
      selectable={false}
      onClick={handleMenuOperation}
    >
      <Menu.Item key="1">
        <SelectOutlined style={{fontSize: 16}} /> 展开/折叠
      </Menu.Item>
      <Menu.Item key = "2">
        <CloseCircleOutlined style={{fontSize: 16}} /> 隐藏节点
      </Menu.Item>
      <Menu.Item key = "3">
        <SettingOutlined style={{fontSize: 16}} /> 其他操作
      </Menu.Item>
    </Menu>
    </>
  )
}

export default connect()(Graph);