// 布局类型
export enum Layout {
  Force,  // 0-力导向图
  Tree,   // 1-树状图
  Circle  // 2-环形图 
}

// 实体类别
export enum entityClass {
  CurrentNode,  // 0-当前节点
  Company, // 1-公司
  People, // 2-人员
  Institution, // 3-产品
  Literal, // 4-字面量
} 

// export const ENTITY_GROUP = ["分析主体", "企业", "人员", "产品", "属性值"];
// export const COLOR_RANGE = ['#ff9e6d', '#86cbff', '#c2e5a0', '#bc97f7', '#fff686'];

/**
 * 0 - 企业
 * 1 - 产品
 * 2 - 合作项目
 * 3 - 投融资项目
 */

export const ENTITY_GROUP = ["分析主体", "企业", "产品", "合作项目", "投融资项目"];
export const COLOR_RANGE = ['#ff9e6d', '#86cbff', '#c2e5a0', '#bc97f7', '#fff686'];