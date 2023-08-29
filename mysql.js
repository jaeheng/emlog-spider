const mysql = require("mysql2");
const config = require("./config");
const imageDownloader = require("./imageDownloader");
const log = require("./log");

// 生成随机字符串
function generateRandomString(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// 生成随机文件名
function generateRandomFileName(extension) {
  const timestamp = Date.now();
  const randomString = generateRandomString(8);
  return `${timestamp}_${randomString}.${extension}`;
}

const interfaces = {
  query: function (sql, callback) {
    const connection = mysql.createConnection(config.mysql);
    connection.connect();

    connection.query(sql, function (error, results, fields) {
      if (error) {
        if (error.sqlMessage) {
          log.error("MySQL Error sqlMessage: " + error.sqlMessage);
        } else if (error.code) {
          log.error("MySQL Error code: " + error.code);
        } else if (error.errno) {
          log.error("MySQL Error errno: " + error.errno);
        } else {
          log.error("MySQL Error errno: " + JSON.stringify(error));
        }
        log.error(sql);
      }
      typeof callback === "function" && callback(results);
    });

    connection.end();
  },
  insert_log: function (sortid, title, content, excerpt, cover) {
    const date = new Date();
    const now = parseInt(date.getTime() / 1e3);

    interfaces.query(
      `select * from ${config.db_prefix}blog where title = '${title}'`,
      function (res) {
        if (res !== undefined) {
          // 没有则新增
          if (res.length === 0) {
            log.info(
              "插入文章信息: " + title + ", 时间: " + date.toLocaleString()
            );

            // 保存图片
            if (cover) {
              const imgName = generateRandomFileName("png");
              imageDownloader.downloadImage(
                cover,
                config.emlogPath + "content/uploadfile/",
                imgName
              );
              cover = "../content/uploadfile/" + imgName;
            }
            interfaces.query(
              `INSERT INTO ${config.db_prefix}blog (title, date, content, excerpt, cover, sortid) VALUES ('${title}', ${now}, '${content}', '${excerpt}', '${cover}', ${sortid});`
            );
          }
        }
      }
    );
  },
};

module.exports = interfaces;
