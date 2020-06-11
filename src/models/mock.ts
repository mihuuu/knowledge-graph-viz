import { RawData, Node, Link, GraphData } from './interface/GraphData';
import { VizConfig } from './interface/VizConfig';
import { ENTITY_GROUP, COLOR_RANGE } from './constant';

// mock 图谱数据
export const graphData: RawData = {
	"nodes": [
		{"id": 'n1', "name": "阿里巴巴",  "group": 0},
		{"id": 'n2', "name": "网易",  "group": 0},
		{"id": 'n3', "name": "马云",  "group": 2},
		{"id": 'n4', "name": "丁磊",  "group": 2},
		{"id": 'n5', "name": "杭州市政府",  "group": 0},
    {"id": 'n6', "name": "蚂蚁金服",  "group": 0},
    {"id": 'n7', "name": "浙江大学",  "group": 0},
		{"id": 'n8', "name": "钉钉",  "group": 1},
		{"id": 'n9', "name": "玉古路",  "group": 3},
		{"id": 'n10', "name": "123456",  "group": 3},
		{"id": 'n11', "name": "淘宝", "group": 1},
		{"id": 'n12', "name": "有道", "group": 1},
		{"id": 'n13', "name": "西溪园区", "group": 3},
		{"id": 'n14', "name": "@alibaba.com", "group": 3},
		{"id": 'n15', "name": "@zju.edu.cn", "group": 3},
		{"id": 'n16', "name": "西湖大学", "group": 0},
		{"id": 'n17', "name": "XXX", "group": 3},
		{"id": 'n18', "name": "???", "group": 3},
	],
	"links": [
		{"id": '1', "source": 'n1', "target": 'n2', "relation": "竞争", "weight": 2},
		{"id": '2', "source": 'n1', "target": 'n3', "relation": "老板", "weight": 1},
		{"id": '3', "source": 'n2', "target": 'n4', "relation": "老板", "weight": 1},
    {"id": '4', "source": 'n1', "target": 'n6', "relation": "持有", "weight": 1},
    {"id": '5', "source": 'n1', "target": 'n5', "relation": "合作", "weight": 4},
    {"id": '6', "source": 'n1', "target": 'n7', "relation": "合作", "weight": 4},
    {"id": '7', "source": 'n1', "target": 'n8', "relation": "持有", "weight": 1},
    // {"id": 8, "source": 3, "target": 4, "relation": "朋友", "weight": 1}, //*
		{"id": '10', "source": 'n7', "target": 'n9', "relation": "地址", "weight": 1},
		{"id": '11', "source": 'n7', "target": 'n10', "relation": "电话", "weight": 1},
		{"id": '12', "source": 'n1', "target": 'n11', "relation": "持有", "weight": 1},
		{"id": '13', "source": 'n2', "target": 'n12', "relation": "持有", "weight": 1},
		{"id": '14', "source": 'n1', "target": 'n13', "relation": "地址", "weight": 1},
		{"id": '15', "source": 'n1', "target": 'n14', "relation": "邮箱", "weight": 1},
		{"id": '16', "source": 'n7', "target": 'n15', "relation": "邮箱", "weight": 1},
		{"id": '17', "source": 'n7', "target": 'n16', "relation": "合作", "weight": 1},
		{"id": '18', "source": 'n16', "target": 'n17', "relation": "地址", "weight": 1},
		{"id": '19', "source": 'n16', "target": 'n5', "relation": "合作", "weight": 1},
		{"id": '20', "source": 'n4', "target": 'n18', "relation": "电话", "weight": 1},
		// {"id": 21, "source": 5, "target": 7, "relation": "合作", "weight": 1},
	]
}

export const defaultConfig: VizConfig = {
  entityGroup: ENTITY_GROUP,
  colorRange: COLOR_RANGE,
  graphConfig: {
    svgWidth: 1200,
    svgHeight: 600,
    linkDistance: 120,
    chargeStrength: -700,
    highlightColor: "#ff9e6d",
    linkColor: "#999",
    linkWidth: 1,
    linkTextSize: 12,
    nodeSize: 30,
    nodeTextSize: 12,
  }
}


export const testData = generateData(50);

function generateData(n: number): RawData {
	const nodes: Node[] = [];
	const links: Link[] = [];

	// [min, max)
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max-min)) + min;
	}

	for(let i=0; i<n; i++) {
		nodes.push({
			id: `${i}`,
			name: '节点' + i,
			group: getRandomInt(1, 5)
		})
	}

	nodes[0].group = 0;

	for(let i=0; i<2*n; i++) {
		if(i < n) {
			links.push({
				id: `${i}`,
				source: '0',
				target: `${getRandomInt(1, n/2)}`,
				relation: Math.random() > 0.5 ? "关系1" : "关系2"
			})
		} else {
			links.push({
				id: `${i}`,
				source: `${getRandomInt(1, n/2)}`,
				target: `${getRandomInt(n/2, n)}`,
				relation: Math.random() > 0.5 ? "关系1" : "关系2"
			})
		}
	}

	return {nodes, links};
}
