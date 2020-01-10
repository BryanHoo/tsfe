import { Excel } from './excel';
import { react, reachHandleMethod, excelPath, alarmType, wcms5, IConfig } from './config';
import * as _ from 'lodash';

class Translate extends Excel {
  constructor(path: string) {
    super(path);
    this.init();
  }

  private init() {
    this.react(react);
    this.reachHandleMethod(reachHandleMethod);
    this.wcms5(wcms5, alarmType);
  }
  /**
   * 生成 react 翻译
   */
  private react(config: IConfig) {
    const { name, key, value, tabName, rowStart } = config;
    const data = super.sheetToAoa(tabName, rowStart);
    const cache: { [key: string]: string } = {};
    data.forEach(item => {
      cache[item[key]] = item[value];
    });
    const strData = `"tr-TR":{translation: ${JSON.stringify(cache, null, 4)}},`;
    super.insertData(strData, '../cache/i18next.js', '"zh-CN": {');
    super.writeJson(cache, `../dist/${name}.json`, 'json');
  }
  /**
   * 生成 reactMethod
   */
  private reachHandleMethod(config: IConfig) {
    const { key, value, name, tabName, rowStart } = config;
    const data = super.sheetToAoa(tabName, rowStart);
    const cache: { [key: string]: string } = {};
    data.forEach(item => {
      cache[item[key]] = item[value];
    });
    const dataStr = `handleMethod${name}Lang: ${JSON.stringify(cache, null, 4)},`;
    super.insertData(dataStr, '../cache/enums.js', 'handleMethodCNLang: {');
  }
  /**
   * 生成 wcms5 翻译
   */
  private wcms5(config: IConfig, config2: IConfig) {
    const { key, value, tabName, rowStart } = config;
    const data = super.sheetToAoa(tabName, rowStart);
    const alarmData = super.sheetToAoa(config2.tabName, config2.rowStart);
    const cache: { [key: string]: string } = {};
    data.forEach(item => {
      cache[item[key]] = item[value];
    });
    alarmData.forEach(item => {
      cache[item[config2.key]] = item[config2.value];
    });
    const sortData: { [key: string]: string } = {};
    _.sortBy(Object.keys(cache)).forEach(key => {
      sortData[key] = cache[key];
    });
    super.writeIni(sortData, `../dist/lang.ini.js`);
  }
}

new Translate(excelPath);
