const config = require('../config');
const log = require('../log');
const https = require('https');
const total = config.pageSize; // 获取条数
const mysql = require('../mysql');
const sortId = 67

const url = 'https://is-lq.snssdk.com/api/suggest_words/?business_id=10016'

/**
 * 接口数据转换
 * @param resp
 * @returns {*[]}
 */
function getPageData (resp) {
  resp = JSON.parse(resp)
  if (Number(resp.errno) === 0) {
    const dataList = resp.data[0].words
    const temp = []
    dataList.map((item, index) => {
      const url = `https://so.toutiao.com/search?keyword=${item.word.replace(" ", "+")}`;
      if (index < total) {
        temp.push({
          title: item.word,
          href: url,
          hotDesc: "",
          image: ""
        })
      }
    })
    return temp
  }
  return []
}

function fetch() {
  // 采用http模块向服务器发起一次get请求
  log.summary('开始获取头条热搜数据!')
  https.get(url, function (res) {
    let html = ''; // 用来存储请求页面的html内容
    res.setEncoding('utf-8');

    // 监听data事件， 每次读取一块数据
    res.on('data', function (chunk) {
      html += chunk;
    });

    // 监听end事件， 都读取完毕执行回调函数
    res.on('end', function () {
      log.info('头条热搜数据获取完毕!')
      log.summary('头条热搜数据获取完毕!')
      let data = getPageData(html)
      try {
        // 0. 获取mysql数据，根据word进行对比
        data.map(item => {
          const content = `${item.hotDesc} \n\n 来源地址: [${item.href}](${item.href})`;
          mysql.insert_log(sortId, item.title, content.trim(), item.hotDesc, item.image);
        })
      } catch (e) {
        log.error(e.message)
      }
    });
  })
}
module.exports = {
  fetch: fetch
}