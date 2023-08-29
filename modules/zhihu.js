const config = require("../config");
const log = require("../log");
const https = require("https");
const cheerio = require("cheerio");
const total = config.pageSize; // 获取条数
const mysql = require("../mysql");
const sortId = 73;

const url = "https://www.zhihu.com/billboard";

/**
 * 页面数据转换为js数组
 * @param $
 * @returns {*[]}
 */
function getPageData(html) {
  try {
    let $ = cheerio.load(html);
    let data = $("#js-initialData")[0].children[0].data;
    data = JSON.parse(data);
    let hotList = data.initialState.topstory.hotList;
    const list = [];
    hotList.map((item, index) => {
      if (index < total) {
        const views = parseInt(item.target.metricsArea.text);
        if (!isNaN(views)) {
          list.push({
            title: item.target.titleArea.text,
            href: decodeURI(item.target.link.url),
            hotDesc: item.target.excerptArea.text,
            image: item.target.imageArea.url,
          });
        }
      }
    });
    log.summary("知乎热搜数据处理完毕!");
    return list;
  } catch (err) {
    console.log("err", err);
  }
}

function fetch() {
  // 采用http模块向服务器发起一次get请求
  log.summary("开始获取知乎热搜数据!");
  https.get(url, function (res) {
    let html = ""; // 用来存储请求页面的html内容
    res.setEncoding("utf-8");

    // 监听data事件， 每次读取一块数据
    res.on("data", function (chunk) {
      html += chunk;
    });

    // 监听end事件， 都读取完毕执行回调函数
    res.on("end", function () {
      log.info("知乎热搜数据获取完毕!");
      log.summary("知乎热搜数据获取完毕!");
      let data = getPageData(html);
      try {
        // 0. 获取mysql数据，根据title进行对比
        data.map((item) => {
          const content = `${item.hotDesc} \n\n 来源地址: [${item.href}](${item.href})`;
          mysql.insert_log(
            sortId,
            item.title,
            content.trim(),
            item.hotDesc,
            item.image
          );
        });
      } catch (e) {
        console.log("error error");
        log.error(e.message);
      }
    });
  });
}

module.exports = {
  fetch: fetch,
};
