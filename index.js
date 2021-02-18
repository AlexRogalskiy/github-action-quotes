'use strict';

const core = require('@actions/core');
const path = require('path');
const http = require('https');
const fs = require('fs');

const config = require('./src/config');
const { notBlankOrElse } = require('./src/utils');

async function createSnapshot(url, filePath, fileName) {
  try {
    const imagePath = path.join(filePath, `${fileName}.${config.extension}`);
    console.log(`Generating screenshot with parameters: url=${url}, file=${imagePath}\n`);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }

    const image = await fs.createWriteStream(imagePath);
    await http.get(url, resp => {
      resp.pipe(image);
    });

    return imagePath;
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  const category = core.getInput('category');
  const pattern = core.getInput('pattern');
  const width = notBlankOrElse(core.getInput('width'), config.width);
  const height = notBlankOrElse(core.getInput('height'), config.height);

  const backgroundColor = notBlankOrElse(core.getInput('backgroundColor'), config.backgroundColor);
  const fontColor = notBlankOrElse(core.getInput('fontColor'), config.fontColor);
  const opacity = notBlankOrElse(core.getInput('opacity'), config.opacity);
  const colorPattern = notBlankOrElse(core.getInput('colorPattern'), config.colorPattern);

  const fileName = notBlankOrElse(core.getInput('name'), config.name);
  const filePath = notBlankOrElse(core.getInput('path'), config.path);

  let target = `${config.url}?category=${category}&pattern=${pattern}`;
  target = `${target}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}`;
  target = `${target}&backgroundColor=${backgroundColor}&fontColor=${fontColor}`;
  target = `${target}&opacity=${opacity}&colorPattern=${colorPattern}`;

  const imagePath = await createSnapshot(target, filePath, fileName);

  core.setOutput('image', imagePath);
}

module.exports = run;

if (require.main === module) {
  run();
}
