import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as _ from 'lodash';
import prettier from 'prettier';

const prettierConfig: prettier.Options = { quoteProps: 'consistent', tabWidth: 4, printWidth: 120 };

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
    return path.resolve(__dirname, ...paths);
  }
  /**
   * 生成文件
   * @param path 路径
   * @param data 数据
   */
  protected touch(path: string, data: any) {
    fs.writeFile(this.getPath([path]), data, 'utf8', err => {
      if (err) throw err;
      console.log(`success ${this.getPath([path])}`);
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
    fs.writeFileSync(src, prettier.format(data.join('\r\n'), prettierConfig));
    fse.copy(src, this.getPath([`../dist/${basename}`]), err => {
      if (err) throw err;
      console.log(`success ${src}`);
    });
  }
}
