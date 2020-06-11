import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { connect } from 'dva';
import { Checkbox, Button } from 'antd';
import './style.less';

const entityOptions = [
  { label: '企业', value: 0 },
  { label: '产品', value: 1 },
  { label: '合作项目', value: 2 },
  { label: '投融资项目', value: 3 },
];

const relationOptions = ['竞争', '合作', '供应商', '发布', '参与融资', '进行投资']
  .map(d => ({label: d, value: d}));

const allEntityValues = entityOptions.map(d => d.value);
const allRelationValues = relationOptions.map(d => d.value);

const FilterPanel = (props) => {
  const { dispatch } = props;
  const [checkAllEntity, setCheckAllEntity] = useState(true);
  const [checkAllRelation, setCheckAllRelation] = useState(true);
  const [entityList, setEntityList] = useState(allEntityValues);
  const [relationList, setRelationList] = useState(allRelationValues);

  // 全选
  const checkAllChange = (type) => (e) => {
    if(type === "entity") {
      const checkList = e.target.checked ? allEntityValues : [];
      setCheckAllEntity(!checkAllEntity)
      setEntityList(checkList);
    } else if(type === "relation") {
      const checkList = e.target.checked ? allRelationValues : [];
      setCheckAllRelation(!checkAllRelation)
      setRelationList(checkList);
    }
  }

  // 每次单选触发
  const filterChange = (type) => (checkedValues) => {
    if(type === "entity") {
      setEntityList(checkedValues);
      setCheckAllEntity(checkedValues.length === entityOptions.length);
    } else if(type === "relation") {
      setRelationList(checkedValues);
      setCheckAllRelation(checkedValues.length === relationOptions.length);
    }
  }

  const applyFilter = () => {
    console.log("filter options: ", entityList, relationList);
    dispatch({
      type: 'graph/filterData',
      payload: { entityList, relationList }
    })
  }

  return (
    <>
      <h2>筛选选项</h2>
      <div>
        <div className="filter-title">
          <strong>分析实体</strong>
          <Checkbox
            style={{ float: 'right' }}
            onChange={checkAllChange("entity")}
            checked={checkAllEntity}
          >
            全选
          </Checkbox>
        </div>   
        <Checkbox.Group
          className="checkbox-group"
          style={{display: 'flex', flexDirection: 'column', paddingLeft: '5px'}}
          options={entityOptions}
          value={entityList}
          onChange={filterChange("entity")}
        />
      </div>
      <div>
        <div className="filter-title">
          <strong>分析关系</strong>
          <Checkbox
            style={{ float: 'right' }}
            onChange={checkAllChange("relation")}
            checked={checkAllRelation}
          >
            全选
          </Checkbox>
        </div>   
        <Checkbox.Group
          className="checkbox-group"
          style={{display: 'flex', flexDirection: 'column', paddingLeft: '5px'}}
          options={relationOptions}
          value={relationList}
          onChange={filterChange("relation")}
        />
      </div>

      {/* <div>
        {[1,2,3,4,5,6,7,8, 9, 10].map(d => <h1 key={d}>test</h1>)}
      </div> */}

      <Button
        block type="primary" size="large" shape="round"
        icon = {<CheckCircleOutlined />}
        style={{position: 'absolute', bottom: '10px', zIndex: 10}}
        onClick={applyFilter}
      >
        应用分析
      </Button>
    </>
  )
}

export default connect()(FilterPanel);