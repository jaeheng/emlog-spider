const log = require('../log');
const https = require('https');
const mysql = require('../mysql');
const cheerio = require("cheerio");
const sortId = 71

const url = 'https://top.baidu.com/board?tab=realtime'

/**
 * 接口数据转换
 * @param $
 * @returns {*[]}
 */
function getPageData ($) {
  const wrapper = $("div[class^='category-wrap']")
  const data = []

  wrapper.each((index, item) => {
    const obj = {}
    const box = $(item)
    const img = box.find("a[class^='img-wrapper']")[0]
    // 文章链接
    obj.href = $(img).attr('href')
    // 文章图片链接
    obj.image = $($(img).find('img')[0]).attr('src')

    const hotIndex = box.find("div[class^='hot-index']")[0]
    // 热搜指数
    obj.hotIndex = Number($(hotIndex).text().trim())

    const title = box.find('.c-single-text-ellipsis')[0]
    // 文章标题
    obj.title = $(title).text().trim();

    const hotDesc = box.find("div[class^='hot-desc']")[0]
    // 文章描述
    obj.hotDesc = $(hotDesc).text().replace('查看更多>', '').trim();

    data.push(obj)
  })
  return data
}

function fetch() {
  // 采用http模块向服务器发起一次get请求
  log.summary('开始获取百度热搜数据!')
  https.get(url, function (res) {
    let html = ''; // 用来存储请求页面的html内容
    res.setEncoding('utf-8');

    // 监听data事件， 每次读取一块数据
    res.on('data', function (chunk) {
      html += chunk;
    });

    // 监听end事件， 都读取完毕执行回调函数
    res.on('end', function () {
      log.info('百度热搜数据获取完毕!')
      log.summary('百度热搜数据获取完毕!')
      let $ = cheerio.load(html);
      let data = getPageData($)
      try {
        // 0. 获取mysql数据，根据title进行对比
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