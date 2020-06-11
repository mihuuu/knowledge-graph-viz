import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { connect } from 'dva';
import { Menu } from 'antd';
import { SelectOutlined, AimOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
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
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
  d3.selectAll(".link-label").data(links)
    .attr("x", d => d.x)
    .attr("y", d => d.y);

  d3.selectAll(".link-path").data(links)
    .attr("d", d => `M ${d.source.x} ${d.source.y} L${d.target.x} ${d.target.y}`);
}

let graphZoom; // 函数？

const TreeGraph = (props) => {
  const { dispatch, raw, root, data, layout, center, focusNode, entityGroup, colorRange, graphConfig, expandNode } = props;
  const { svgWidth, svgHeight, linkDistance, chargeStrength, highlightColor, nodeSize, linkColor, linkTextSize, nodeTextSize } = graphConfig;
  const colorScale = d3.scaleOrdinal() //=d3.scaleOrdinal(d3.schemeSet2)
    .domain(entityGroup)
    .range(colorRange);

  const [clickedNode, setClickedNode] = useState(null); // 选中的节点
  const [operateNode, setOperateNode] = useState(null); // 右键点击的节点
  const [relatedLinks, setRelatedLinks] = useState([]); // 相关的链接

  useEffect(() => {
    // console.log("init mount: ", data);
    initGraph();
  }, [])

  useEffect(() => {
    console.log("re-render: ", data);
    drawGraph(data, layout);
    setClickedNode(null);
  }, [data]);

  useEffect(() => {
    focusNode && handleFocusNode(focusNode);
  }, [focusNode]);

  const initGraph = () => {
    // 视图缩放
    const zoomed = () => {
      d3.select("#svg-container").attr("transform", d3.event.transform);
      // setZoomScale(d3.event.transform.k);
    }

    const zoom = d3.zoom()
      // .extent([[0, 0], [svgWidth, svgHeight]])
      .scaleExtent([0.5, 3])
      .on("zoom", zoomed);
    d3.select("#svg-graph").call(zoom);
    graphZoom = zoom;
  }

  const drawGraph = (data, layout) => {
    if(layout === Layout.Force) {
      drawForceGraph(data);
    } else if(layout === Layout.Tree) {
      drawTreeGraph(data);
    } else if(layout === Layout.Circle) {
      drawCircleGraph(data);
    }
  }

  // 绘制力导向图
  const drawForceGraph = (data) => {
    const { nodes, links } = data;
    // 直接取值的话，会改变原来的data（浅拷贝）
    d3.select("#svg-graph").call(graphZoom.transform,
      d3.zoomIdentity.translate(0, 0)
    );
    // 创建simulation，设置force参数
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));
      // 此函数之后data.links 从 Link 变为 joinedLink 格式

    // 设定节点位置
    simulation.on("tick", () => setElementPosition(nodes, links));
    // 节点拖拽
    d3.selectAll(".node-circle").call(drag(simulation));
  }

  // 绘制树状图
  const drawTreeGraph = (data) => {
    // const treeLayout = d3.tree().size([800, 400]);
    // treeLayout(root);
    const { nodes, links } = data;
    // setElementPosition(data.nodes, data.links);          
    d3.selectAll(".node-circle").data(nodes)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    d3.selectAll(".node-text").data(nodes)
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    d3.selectAll(".link-line").data(links)
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
    d3.selectAll(".link-label").data(links)
      .attr("x", d => d.x)
      .attr("y", d => d.y);

    d3.selectAll(".link-path").data(links)
      .attr("d", d => `M ${d.source.x} ${d.source.y} L${d.target.x} ${d.target.y}`);

    // d3.selectAll(".node, .link").attr("transform", "translate(150, 100)");
    d3.select("#svg-graph").call(graphZoom.transform,
      d3.zoomIdentity.translate(150,100)
    );
    d3.selectAll(".node-circle").on(".drag", null); // 清除力导向图的drag作用
  }

  // 绘制辐射图
  const drawCircleGraph = (data) => {
    // const cluster = d3.tree().size([360, 400]); // x-360角度；y-最大半径
    // cluster(root);

    // d3.selectAll(".node-circle").data(data.nodes)
    //   .attr("cx", 0)
    //   .attr("cy", d => -d.y)
      // .attr("transform", d => `rotate(${d.x}, 0, 0)`);
      
    const getX = (d) => d.y * Math.sin(d.x * Math.PI / 180);
    const getY = (d) => -d.y * Math.cos(d.x * Math.PI / 180);

    d3.selectAll(".node-circle").data(data.nodes)
      .attr("cx", getX)
      .attr("cy", getY);

    d3.selectAll(".node-text").data(data.nodes)
      .attr("x", getX)
      .attr("y", getY);

    d3.selectAll(".link-line").data(data.links)
      .attr("x1", d => getX(d.source))
      .attr("y1", d => getY(d.source))
      .attr("x2", d => getX(d.target))
      .attr("y2", d => getY(d.target));
    
    d3.selectAll(".link-label").data(data.links)
      .attr("x", getX)
      .attr("y", getY);

    d3.selectAll(".link-path").data(data.links)
      .attr("d", d => `M ${getX(d.source)} ${getY(d.source)} L${getX(d.target)} ${getY(d.target)}`);
  
    // d3.selectAll(".node, .link").attr("transform", `translate(${svgWidth/2}, ${svgHeight/2})`);
    d3.select("#svg-graph").call(graphZoom.transform,
      d3.zoomIdentity.translate(svgWidth/2, svgHeight/2)
    );
    d3.selectAll(".node-circle").on(".drag", null);
  }

  const handleMouseOver = (e) => {
    // console.log(e.target.__data__);
    if(e.target.classList.contains("node-circle")) {
      if(clickedNode !== e.target.__data__.data.id) {
        e.target.classList.add("node-hover");
      }
      // console.log(e.target.__data__)
      // 节点的相邻链接高亮
      const neighbor = Tool.calcNeighborElements(raw, e.target.__data__.data.id);
      setRelatedLinks(neighbor.links);

      // 淡化相邻节点/链接以外的其他元素
      d3.selectAll(".link-line, .link-path, .link-label")
        .classed("hide-element", d => neighbor.links.indexOf(d.id) === -1);
      
      d3.selectAll(".node-circle, .node-text")
        .classed("hide-element", d => neighbor.nodes.indexOf(d.data.id) === -1);
      

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
      const nodeId = e.target.__data__.data.id;
      console.log("clicked: ", e.target.__data__);
      dispatch({
        type: "graph/setSelectedNode",
        payload: e.target.__data__.data
      })
      setClickedNode(nodeId);
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

      const nodeId = e.target.__data__.data.id;
      setOperateNode(nodeId);
    }
  }

  // 聚焦某个节点
  const handleFocusNode = (nodeId) => {
    console.log("focusNode: ", nodeId);
    const node = data.nodes.find(d => d.data.id === nodeId);
    const offsetX = svgWidth / 2 - node.x;
    const offsetY = svgHeight / 2 - node.y;

    // 定位节点到中心
    d3.selectAll(".node, .link").attr("transform", `translate(${offsetX}, ${offsetY})`);
    
    // 重置zoom
    d3.select("#svg-graph").transition().call(graphZoom.transform,
      d3.zoomIdentity.translate(0,0).scale(1)
    );
    // 选中节点
    setClickedNode(nodeId);
    dispatch({
      type: "graph/setSelectedNode",
      payload: node.data
    })
  }

  // 点击菜单选项
  const handleMenuOperation = ({ key }) => {
    console.log(operateNode);
    switch(key) {
      case '1':
        expandNode(root, operateNode);
        break;
      case '2':
        handleFocusNode(operateNode);
        break;
      default:
        break;
    }

    // 隐藏菜单
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
          { data.nodes.map(({data: item}) => {
            return <g key={item.id} className="node" id={`node-${item.id}`}>
              <circle
                // cx={data.x}
                // cy={data.y}
                stroke="#fff"
                strokeWidth="1.5"
                r={nodeSize}
                fill={getNodeColor(item)}
                cursor="pointer"
                className={`node-circle ${clickedNode === item.id && "node-focus"}`}
                >
              </circle>
              <text
                fill="#000"
                fontSize={clickedNode === item.id ? nodeTextSize+2 : nodeTextSize}
                fontWeight={clickedNode === item.id ? 800 : 0}
                textAnchor="middle"
                alignmentBaseline="central"
                pointerEvents="none"
                className="node-text"
              >
                {item.name}
              </text>
            </g>
          }
          )}
        </g>
      </g>
      <g id="legend-group">
        { entityGroup.map((item, i) =>
          <g key={item} transform={`translate(40, ${svgHeight - 120 + i * 30})`}>
            <circle cx="0" cy="0" r="5" fill={colorScale(item)} />
            <text fontSize="14" x="15" y="5">{item}</text>
          </g>
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
        <AimOutlined style={{fontSize: 16}} /> 聚焦节点
      </Menu.Item>
      <Menu.Item key = "3">
        <CloseCircleOutlined style={{fontSize: 16}} /> 隐藏节点
      </Menu.Item>
      <Menu.Item key = "4">
        <SettingOutlined style={{fontSize: 16}} /> 其他操作
      </Menu.Item>
    </Menu>
    </>
  )
}

export default connect()(TreeGraph);