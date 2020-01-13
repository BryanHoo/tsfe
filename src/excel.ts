import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as _ from 'lodash';
import { prettierConfig } from './config';
import prettier from 'prettier';

export class Excel {
  workbook: xlsx.WorkBook;

  constructor(path: string) {
    this.workbook = this.getWorkBook(path);
  }
  /**
   * 生成真实路径
   * @param paths 需要合成的路径数组
   */
  protected getPath(paths: string[]) {
    return path.join(__dirname, ...paths);
  }
  /**
   * 生成文件
   * @param path 路径
   * @param data 数据
   */
  protected touch(path: string, data: any) {
    fse.outputFile(path, data, 'utf8', err => {
      if (err) throw err;
      console.log(`success ${path}`);
    });
  }
  /**
   * 获取模板对象
   * @param path 模板 excel 路径
   */
  protected getWorkBook(path: string) {
    return xlsx.readFile(this.getPath([path]));
  }
  /**
   * 单张表数据导出
   * @param name excel 单张表名
   * @param start 数据开始行数，从 0 开始
   * @param end 数据结束行数
   */
  protected sheetToAoa(name: string, start = 0, end: number | null = null): string[][] {
    const data: string[][] = xlsx.utils.sheet_to_json(this.workbook.Sheets[name], {
      header: 1
    });
    if (end) {
      return data.slice(start, end);
    }
    return data.slice(start);
  }
  /**
   * 写入 json/js 文件
   * @param data 数据
   * @param path 写入文件路径
   */
  protected writeJson(data: {}, path: string, type: string = 'json') {
    let dataStr = JSON.stringify(data, null, 4);
    if (type === 'js') {
      dataStr = prettier.format(`export default ${dataStr}`);
    }
    this.touch(path, dataStr);
  }
  /**
   * 写入 ini 文件
   * @param data 数据
   * @param path 路径
   */
  protected writeIni(data: { [key: string]: string }, path: string) {
    const str = Object.keys(data).reduce((total, key) => {
      return `${total}${key}=${data[key]}\r\n`;
    }, '');
    this.touch(path, str);
  }
  /**
   * 向指定文件插入数据
   * @param data 需要插入的数据
   * @param path 需要插入的文件路径
   * @param flag 替换位置标志字符串
   */
  protected insertData(strData: string, pathStr: string, flag: string) {
    if (!flag) throw `not found flag, file path: ${path}`;
    const src = this.getPath([pathStr]);
    const basename = path.basename(pathStr);
    const data = fs.readFileSync(src, 'utf8').split(/\r\n|\n|\r/gm);
    const index = data.findIndex(item => item.trim() === flag.trim());
    if (index === -1) throw 'not found translate point comment, please checkout file';
    data.splice(index, 0, strData);
    const dest = this.getPath([`../dist/${basename}`]);
    fs.writeFileSync(dest, prettier.format(data.join('\r\n'), prettierConfig));
    console.log(`success ${dest}`);
  }
  /**
   * 写入 xml
   * @param data 写入数据
   * @param pathStr 写入路径
   * @param name 文件名
   */
  protected writeWcms4(data: string[][], pathStr: string, name: string, flag: string) {
    const dest = this.getPath(['../dist', pathStr, `lang-${name}.${flag}`]);
    const compiled = _.template(
      flag === 'xml'
        ? '<?xml version="1.0" encoding="utf-8" ?>\r\n<Resource>\r\n<% _.forEach(data, function(item) { %><lang id="<%- item[0] %>"><%- item[1] %></lang>\r\n<% }); %></Resource>'
        : 'var lang = {};\r\nif (lang) {\r\n<% _.forEach(data, function(item) { %><%- item[0] %> = "<%- item[1] %>";\r\n<% }); %>};'
    );
    const str = compiled({ data });
    this.touch(dest, flag === 'xml' ? str : prettier.format(str, prettierConfig));
  }
  /**
   * 写入 4.0 js
   * @param data 数据
   * @param pathStr 路径
   */
  protected writeWcmsJs(data: string[][], pathStr: string) {
    const dest = this.getPath(['../dist', pathStr, `lang.js`]);
    const lang: { [key: string]: string } = {};
    const langPower: { [key: string]: string } = {};
    const reg = /(M|C)_/;
    data.forEach(item => {
      if (reg.test(item[0])) {
        const attr = item[0].replace(/^(\'|\")|(\'|\")$/g, '');
        langPower[attr] = item[1];
      } else {
        lang[item[0]] = item[1];
      }
    });
    const str = `(function (window) {var lang=${JSON.stringify(lang)}; var langPower=${JSON.stringify(
      langPower
    )};window.lang = window.lang || lang;window.langPower = window.langPower || langPower;return;})(window);`;
    this.touch(dest, prettier.format(str, prettierConfig));
  }

  protected writeAds(data: {}[]) {
    const str = `(function(b) {var a = { ads_eventtype: ${JSON.stringify(
      data
    )}};return b.langdb = b.langdb || a;})(window);`;
    this.touch(this.getPath(['../dist/langdb.js']), prettier.format(str, prettierConfig));
  }
}
