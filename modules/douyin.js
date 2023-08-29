const config = require('../config');
const log = require('../log');
const https = require('https');
const total = config.pageSize; // 获取条数
const mysql = require('../mysql');
const sortId = 70;

const url = 'https://aweme.snssdk.com/aweme/v1/hot/search/list/'
const urlPrefix = 'https://www.douyin.com/search/'

/**
 * 接口数据转换
 * @param resp
 * @returns {*[]}
 */
function getPageData (resp) {
  resp = JSON.parse(resp)
  if (resp.status_code === 0) {
    const temp = []
    resp.data.word_list.map((item, index) => {
      const word = item.word
      if (index < total) {
        temp.push({
          hotDesc: word,
          href: urlPrefix + word,
          title: word,
          image: item.word_cover.url_list[0]
        })
      }
    })
    return temp
  }
  return []
}

function fetch() {
  // 采用http模块向服务器发起一次get请求
  log.summary('开始获取抖音热搜数据!')
  https.get(url, function (res) {
    let html = ''; // 用来存储请求页面的html内容
    res.setEncoding('utf-8');

    // 监听data事件， 每次读取一块数据
    res.on('data', function (chunk) {
      html += chunk;
    });

    // 监听end事件， 都读取完毕执行回调函数
    res.on('end', function () {
      log.info('抖音热搜数据获取完毕!')
      log.summary('抖音热搜数据获取完毕!')
      let data = getPageData(html)
      try {
        // 0. 获取mysql数据，根据word进行对比
        data.map(item => {

          const content = `${item.hotDesc} \n\n 来源地址: [${item.href}](${item.href})`
          mysql.insert_log(sortId, item.title, content.trim(), item.hotDesc, item.image)
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