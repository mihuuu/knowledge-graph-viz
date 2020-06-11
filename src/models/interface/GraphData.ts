// 节点（实体）
export interface Node {
  id: string; // 节点id
  name: string; //节点名称
  group: number; // 节点类别
  attr?: any; // 节点属性（具体信息）
  [key: string]: any; // 其他属性
}

export type NodeId = string;
export type LinkId = string;
export type NodeIdArray = string[];
export type LinkIdArray = number[];

// 链接（关系）
export interface Link {
  id: LinkId; //链接id
  source: NodeId; // 链接起点（关联节点id）
  target: NodeId; // 链接终点（关联节点id）
  relation: string; // 关系名称
  weight?: number; // 关系权重
  [key: string]: any; // 其他属性
}

// 绑定数据后的链接
export interface joinedLink {
  id: LinkId;
  source: Node;
  target: Node;
}

// 知识图谱数据结构
export interface RawData {
  nodes: Array<Node>; // 节点集合
  links: Array<Link>; // 链接集合
}

export interface GraphData {
  nodes: Array<Node>; // 节点集合
  links: Array<joinedLink>; // 链接集合
}

// 通过nodeId获取节点在nodes数组的index
export interface NodeMap {
  [key: string]: number;
}

export interface IdGroup {
  nodes: NodeId[];
  links: LinkId[];  // link id
}

// hierarchy root
export interface TreeNode extends Node {
  children: Array<TreeNode>;
}

export interface HierarchyNode {
  data: TreeNode,
  children: Array<HierarchyNode>,
  depth: number;
  height: number;
  x: number;
  y: number;
}

export interface TreeData {
  nodes: Array<HierarchyNode>,
  links: {
    source: HierarchyNode,
    target: HierarchyNode,
  }
}