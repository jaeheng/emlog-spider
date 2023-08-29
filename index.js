const modules = [
  require("./modules/weibo"),
  require("./modules/zhihu"),
  require("./modules/douyin"),
  require("./modules/baidu"),
  require("./modules/toutiao"),
  require("./modules/juejin"),
];

modules.map((item) => {
  item.fetch();
});
