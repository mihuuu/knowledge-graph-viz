// 可视化配置
export interface VizConfig {
  entityGroup: string[];  // 分类名称
  colorRange: string[]; // 分类颜色
  graphConfig: {
    svgWidth: number;
    svgHeight: number;
    linkDistance: number; //力导向图的链接距离
    chargeStrength: number; // 力导向图的节点斥力
    highlightColor: string; // 鼠标悬浮高亮颜色
    linkColor: string;
    linkWidth: number;
    linkTextSize: number;
    nodeSize: number; // 节点大小
    nodeTextSize: number; // 节点中的文字大小
  }
 
}
