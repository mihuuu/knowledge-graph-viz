import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const svgWidth = 600;
const svgHeight = 600;


const drag = simulation => {
  
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

const drawGraph = (ref, data) => {
  const svg = d3.select(ref.current);
  const { nodes, links } = data;

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2));

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.weight));

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 20)
      .attr("fill", d => colorScale(d.group))
      .call(drag(simulation));

  node.append("title")
      .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });
}


const Graph = (props) => {
  const graphRef = useRef(null);

  useEffect(() => {
    drawGraph(graphRef, props.data);
  }, [props.data]);

  return (
    <svg width = {svgWidth} height = {svgHeight} ref={graphRef}>
    </svg>
  )
}

export default Graph;