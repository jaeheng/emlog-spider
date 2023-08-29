const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 异步下载图片并保存到指定路径
async function downloadImageAsync(url, saveDirectory, imageFileName) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");

  const savePath = path.join(saveDirectory, `${year}${month}${day}/`);
  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const imagePath = path.join(savePath, imageFileName);
  console.log(imagePath);

  try {
    const response = await axios.get(url, { responseType: "stream" });

    response.data.pipe(fs.createWriteStream(imagePath));

    response.data.on("end", () => {
      console.log("图片下载完成并保存到", imagePath);
    });
  } catch (error) {
    console.error("下载图片时出错：", error);
  }
}

module.exports = {
  downloadImage: downloadImageAsync,
};
