// 掘金前端热门
const superagent = require("superagent");
const mysql = require("../mysql");
const log = require("../log");
const sortId = 45;
let params = {
  id_type: 2,
  sort_type: 200,
  cate_id: "6809637767543259144",
  tag_id: "6809640407484334093",
  cursor: "0",
  limit: 20,
};

function getInfo() {
  // 利用superagent 模块发送请求，注意请求头的设置和POST请求体数据（请求参数）
  log.info("掘金前端热门数据获取完毕!");
  superagent
    .post(
      "https://api.juejin.cn/recommend_api/v1/article/recommend_cate_tag_feed?aid=2608&uuid=7017632423543490052"
    )
    .send(params)
    .set("X-Agent", "Juejin/Web")
    .end((err, res) => {
      if (err) {
        return console.log(err);
      }
      log.summary("掘金前端热门数据获取完毕!");
      const body = res.body;
      const data = [];
      if (body.err_no === 0 && body.err_msg === "success") {
        body.data.map((item) => {
          const info = item.article_info;
          data.push({
            hotDesc: info.brief_content.trim(),
            href: getUrl(info.article_id),
            title: info.title.trim(),
            image: info.cover_image,
          });
        });

        data.sort((a, b) => {
          return b.views - a.views;
        });

        saveData(data);
      }
      return false;
    });
}

function getUrl(id) {
  return `https://juejin.cn/post/${id}`;
}

function saveData(data) {
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
    log.error(e.message);
  }
}

module.exports = {
  fetch: getInfo,
};
