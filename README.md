# hot-search

> 热点新鲜事采集

## 使用方式

准备工作：先导入 database.sql 到 mysql 数据库中，然后进行以下步骤

第一步: 先配置数据库：

```shell
cp config-demo.js config.js
vim config.js
```

第二步: 运行命令

```shell
// 安装依赖
npm install
// 微博热搜
node index.js
```

第三步: 使用定时任务

```shell
crontab -e
// 每1个小时
0 */1 * * * /usr/local/bin/node /var/www/hot-search-spider/index.js
```

## 热榜链接

weibo

> https://s.weibo.com/top/summary

zhihu

> https://www.zhihu.com/billboard

douyin

> https://aweme.snssdk.com/aweme/v1/hot/search/list/
