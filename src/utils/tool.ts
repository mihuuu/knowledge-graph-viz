import { Node, Link, joinedLink, GraphData, RawData, IdGroup,
  TreeNode, NodeId, NodeIdArray, NodeMap, HierarchyNode } from '../models/interface/GraphData';

// 获取节点的相邻链接/节点（起点+终点）
export function calcNeighborElements(data: RawData, center: NodeId): IdGroup {
  const neighborLinks = data.links.filter(
    d => (d.source === center || d.target === center)
  );
  const neighborNodes: NodeId[] = [];
  for(let link of neighborLinks) {
    if(neighborNodes.indexOf(link.source) === -1) {
      neighborNodes.push(link.source);
    }
    if(neighborNodes.indexOf(link.target) === -1) {
      neighborNodes.push(link.target);
    }
  }

  return {
    nodes: neighborNodes,
    links: neighborLinks.map(d => d.id)
  }
  
}


// 展开一个节点，返回新增数据（包括from和to链接）
export function expandNode(data: GraphData, curData: GraphData, node: NodeId): GraphData {
  const curNodes = curData.nodes.map(d => d.id);
  const curLinks = curData.links.map(d => d.id);
  const relatedLinks = data.links.filter(d => d.source.id === node || d.target.id === node);
  const newLinks: Array<joinedLink> = [];
  const newNodes: Array<Node> = [];

  for(let link of relatedLinks) {
    curLinks.indexOf(link.id) === -1 && newLinks.push(link);
    curNodes.indexOf(link.source.id) === -1 && newNodes.push(link.source);
    curNodes.indexOf(link.target.id) === -1 && newNodes.push(link.target);
  }

  // return {
  //   nodes: [...curData.nodes, ...newNodes],
  //   links: [...curData.links, ...newLinks]
  // }
  return {
    nodes: newNodes,
    links: newLinks
  }
}

// 折叠节点，隐藏相邻链接与字面量（本节点保留）
export function toggleNode(data: GraphData, node: NodeId): GraphData {
  const relatedLinks = data.links.filter(d => d.source.id === node || d.target.id === node);
  const literalNodes = relatedLinks.map(d => d.target).filter((node:Node) => node.group === 4);
  return {
    nodes: literalNodes,
    links: relatedLinks
  }
}

export function expandOrToggleNode(data: GraphData, curData: GraphData, node: NodeId, isExpand: boolean): GraphData {
  if(isExpand) {
    return expandNode(data, curData, node);
  } else {
    return toggleNode(data, node);
  }
}

// 展开下一层节点（只算to链接）
export function expandNextLayer(data: GraphData, node: NodeId): GraphData {
  const relatedLinks = data.links.filter(d => d.source.id === node);
  const relatedNodesId = relatedLinks.map(d => d.target.id);
  const relatedNodes = data.nodes.filter(d => relatedNodesId.indexOf(d.id) !== -1);

  return { nodes: relatedNodes, links: relatedLinks };
}


export function findCenterNode(data: RawData): Node {
  // return data.nodes.find(d => d.group === 0);
  return data.nodes[0];
}

// 设定显示层数（下钻）
export function displayLayerData(data: GraphData, level: number): GraphData {
  const resNodes: Array<Node> = [];
  const resLinks: Array<joinedLink> = [];
  let curLayerNodes: NodeIdArray = []; // 当前层的节点
  const visitedNodes: boolean[] = [];  // 存储已有节点id，避免重复添加
  let startNode: NodeId;

  // 获取当前节点
  for(let node of data.nodes) {
    if(node.group === 0) {
      startNode = node.id;
      resNodes.push(node);
      curLayerNodes.push(startNode);
      break;
    }
  }
  
  for(let i=0; i<level; i++) {
    let nextLayerNodes: NodeIdArray = [];  // 存储下一层节点
    for(let node of curLayerNodes) {
      const targetData = expandNextLayer(data, node);  // 获取下一层的节点和链接
      // console.log("next layer", node, targetData);
      targetData.nodes.forEach(d => {
        if(!visitedNodes[d.id]) {
          resNodes.push(d); // 若节点不重复，则加入res
        }
      })
      resLinks.push(...targetData.links);
      nextLayerNodes.push(...targetData.nodes.map(d => d.id));
      visitedNodes[node] = true; //设置当前节点已访问
    }
    curLayerNodes = nextLayerNodes;
  }

  return {
    nodes: resNodes,
    links: resLinks
  };
}


// 将原始数据构造为 hierarchy 数据（递归）
// export function buildTree(data: RawData, node: Node): TreeNode {
//   const nodeMap = mapNodeIndex(data.nodes);
//   const visitedNodes: NodeId[] = [];

//   function recurse(data: RawData, node: Node): TreeNode {
//     const targetLinks = data.links.filter(d => d.source === node.id);
//     if(targetLinks.length === 0) {
//       return {
//         ...node,
//         children: []
//       };
//     }
//     const children: Array<TreeNode> = [];
//     for(let link of targetLinks) {
//       if(visitedNodes.includes(link.target)) continue;  // 避免重复访问节点
//       const targetNode = data.nodes[nodeMap[link.target]];
//       const node = recurse(data, targetNode);
//       children.push(node);
//       visitedNodes.push(link.target);
//     }
//     return {
//       ...node,
//       children
//     };
//   }

//   const root = recurse(data, node);
//   return root;
// }

export function buildTree(data: RawData, node: Node): TreeNode {
  const nodeMap = mapNodeIndex(data.nodes);
  const visitedNodes: NodeId[] = [];

  const getNode = (id: NodeId) => data.nodes[nodeMap[id]];

  function recurse(data: RawData, node: Node): TreeNode {
    const neighborNodes: Node[] = [];
    visitedNodes.push(node.id);

    for(let link of data.links) {
      if(link.source === node.id && !visitedNodes.includes(link.target)) {
        neighborNodes.push(getNode(link.target));
        visitedNodes.push(link.target);
      }
      if(link.target === node.id && !visitedNodes.includes(link.source)) {
        neighborNodes.push(getNode(link.source));
        visitedNodes.push(link.source);
      }
    }
    if(neighborNodes.length === 0) {
      return {
        ...node,
        children: []
      };
    }

    const children: Array<TreeNode> = [];
    for(let node of neighborNodes) {
      const child = recurse(data, node);
      children.push(child);
    }
    return {
      ...node,
      children
    };
  }

  const root = recurse(data, node);
  return root;
}

export function removeDuplicateNodes(nodes: Array<Node>): Array<Node> {
  const nodesId: NodeIdArray = [];
  const res: Array<Node> = [];
  for(let node of nodes) {
    if(nodesId.indexOf(node.id) === -1) {
      res.push(node);
    }
    nodesId.push(node.id);
  }
  return res;
}

export function mapNodeIndex(nodes: Array<Node>): NodeMap {
  const nodeMap: NodeMap = {};
  for(let i=0; i<nodes.length; i++) {
    nodeMap[nodes[i].id] = i;
  }
  return nodeMap;
}

// D3 tree布局生成的数据，与初始数据顺序一致
export function sortTreeData(data: RawData, nodes: Array<HierarchyNode>): GraphData {
  const nodeMap = mapNodeIndex(data.nodes); // 节点id映射到数组index
    
  // 按原始节点顺序排列
  const sortedNodes: Array<Node> = [];
  for(let node of data.nodes) {
    const newPos = nodes.find(d => d.data.detail.id === node.id);
    newPos && sortedNodes.push({
      ...newPos.data.detail,
      x: newPos.x + 100,
      y: newPos.y + 50
    });
  }

  const sortedLinks: Array<joinedLink> = [];
  for(let link of data.links) {
    const newLink = {
      ...link,
      source: sortedNodes[nodeMap[link.source]],
      target: sortedNodes[nodeMap[link.target]]
    };
    sortedLinks.push(newLink);
  }
  return {
    nodes: sortedNodes,
    links: sortedLinks
  };
}


// 关系发现（与主体拥有相同的XXX）
// 调用eg: exploreSameRelation(raw, 1, "合作")
export function exploreSameRelation(data: RawData, center: NodeId, relation: string): IdGroup {
  const targetLinks = data.links.filter(d => d.source === center && d.relation === relation); // 从主体出发的链接
  const targetNodes = targetLinks.map(d => d.target); // 与主体有XXX关系的节点
  
  const relatedLinks = data.links.filter(d => d.relation === relation && targetNodes.includes(d.target) && d.source !== center);
  const relatedNodes = relatedLinks.map(d => d.source); // 与主体有相同关系的节点
  
  // todo: 只返回targetNode，在主体和target之间新增link？
  return {
    nodes: [center, ...targetNodes, ...relatedNodes],
    links: [...targetLinks, ...relatedLinks].map(d => d.id)
  }
}

// 条件筛选（实体类别/关系类别）
export function filterData(data: RawData, entityOptions: number[], relationOptions: string[]) {
  const nodes = data.nodes.filter((d) => entityOptions.includes(d.group)); // 分析主体必须有
  const nodeIdList = nodes.map(d => d.id);
  const links = data.links.filter(d => 
    relationOptions.includes(d.relation) && nodeIdList.includes(d.source) && nodeIdList.includes(d.target));
  
  console.log(nodeIdList);
  console.log("filter: ", {nodes, links});
  if(nodes.length === 0) {
    return {
      nodes: [data.nodes[0]],
      links: []
    }
  }
  return { nodes, links };
}

export function sortEvents(data: RawData): Array<Node> {
  const compareAttr = '融资时间'; 
  const sortByTime = (a, b) => (a.info[compareAttr] < b.info[compareAttr] ? -1 : 1);
  const investEvents = data.nodes.filter(d => d.group === 3)
    .sort(sortByTime);
  console.log("事件排序:", investEvents);
  return investEvents; // 默认按字符串正序排列
}