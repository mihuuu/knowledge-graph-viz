import request from '../utils/request';

// 输入企业名称，搜索知识图谱
export function searchKG(name) {
  console.log("service start...")
  const url = `http://10.214.223.11:8080/enterprise/info?name=${name}`;
  const data = fetch(url, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    return data;
  })
  .catch(err => {
    console.log("fetch error", err)
  })

  if(data) {
    return data;
  }
}


// export function searchKG(name) {
//   const url = `http://10.214.223.11:8080/enterprise/info?name=${name}`;
//   return request(url);
// }