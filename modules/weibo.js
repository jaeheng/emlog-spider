const log = require('../log');
const https = require('https');
const mysql = require('../mysql');
const sortId = 72

const url = 'https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot'
const urlPrefix = 'https://s.weibo.com/weibo?q='

/**
 * 页面数据转换为js数组
 * @param data
 * @returns {*[]}
 */
function getPageData (data) {
 const cards = data.cards[0] ? data.cards[0].card_group : []
  const items = []
  if (cards) {
    cards.map(item => {
      const keyword = item.actionlog.ext.match(/key:(\S*?)\|/)
     if (keyword && item.desc_extr) {
       items.push({
         title: item.desc.trim(),
         href: urlPrefix + encodeURIComponent(keyword[1]) + '&Refer=top',
         hotDesc: item.desc.trim(),
         image: ""
       })
     }
    })
  }
  log.summary('微博热搜数据处理完毕!')
  return items
}

function fetch() {
  // 采用http模块向服务器发起一次get请求
  log.summary('开始请求微博热搜数据!')
  https.get(url, function (res) {
    let html = ''; // 用来存储请求页面的html内容
    res.setEncoding('utf-8');

    // 监听data事件， 每次读取一块数据
    res.on('data', function (chunk) {
      html += chunk;
    });

    // 监听end事件， 都读取完毕执行回调函数
    res.on('end', function () {
      log.info('微博热搜数据获取完毕!')
      log.summary('微博热搜数据获取完毕!')

      try {
        html = JSON.parse(html)
      }catch (err) {
        log.error('weibo.js 无法解析返回数据')
        return false
      }
      if (html.ok) {
        let data = getPageData(html.data)
        // 0. 获取mysql数据，根据title进行对比
        data.map(item => {
          const content = `${item.hotDesc} \n\n 来源地址: [${item.href}](${item.href})`
          mysql.insert_log(sortId, item.title, content.trim(), item.hotDesc, item.image)
        })
      }
    });
  })
}
module.exports = {
  fetch: fetch
}