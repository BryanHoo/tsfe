import { Excel } from './excel';
import * as path from 'path';
import { ads, react, wcms4, reachHandleMethod, excelPath, alarmType, wcms5, IConfig } from './config';
import * as _ from 'lodash';

class Translate extends Excel {
  constructor(path: string) {
    super(path);
    this.init();
  }

  private init() {
    this.react(react);
    this.reachHandleMethod(reachHandleMethod, alarmType);
    this.wcms5(wcms5, alarmType);
    this.wcms4(wcms4);
    this.ads(ads);
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
    super.insertData(strData, '../dist/i18next.js', new RegExp('zh-CN'), new RegExp('tr-TR'));
    super.writeJson(cache, `../dist/${name}.json`, 'json');
  }
  /**
   * 生成 reactMethod
   */
  private reachHandleMethod(config: IConfig, config2: IConfig) {
    const { key, value, name, tabName, rowStart } = config;
    const data = super.sheetToAoa(tabName, rowStart);
    const alarmData = super.sheetToAoa(config2.tabName, config2.rowStart);
    const cache: { [key: string]: string } = {};
    const cache2: { [key: string]: string } = {};
    data.forEach(item => {
      cache[item[key]] = item[value];
    });
    alarmData.forEach(item => {
      const number = item[config2.key].match(/\d+/);
      if (number) {
        cache2[number[0]] = item[config2.value];
      }
    });
    const dataStr = `handleMethod${name}Lang: ${JSON.stringify(cache, null, 4)},`;
    const dataStr2 = `ceibaAlarmType${name}Lang: ${JSON.stringify(cache2, null, 4)},`;
    super.insertData(
      dataStr,
      '../dist/enums.js',
      new RegExp('handleMethodCNLang'),
      new RegExp(`handleMethod${name}Lang`)
    );
    super.insertData(
      dataStr2,
      '../dist/enums.js',
      new RegExp('ceibaAlarmTypeCNLang'),
      new RegExp(`ceibaAlarmType${name}Lang`)
    );
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

  private wcms4(config: IConfig) {
    const { key, value, tabName, rowStart, name } = config;
    const data = super.sheetToAoa(tabName, rowStart);
    const group = _.groupBy(data, item => item[0]);
    const groupData: { [key: string]: string[][] } = {};
    Object.keys(group).forEach(attr => {
      const index = attr.split('\\').join(path.sep);
      groupData[index] = group[attr].map(item => {
        return [item[key], item[value]];
      });
    });
    Object.keys(groupData).forEach(attr => {
      const reg = /autoDownload/i;
      const suffix = /\.xml$/;
      if (reg.test(attr)) {
        super.writeWcms4(groupData[attr], path.dirname(attr), name ? name : 'zh-CN', suffix.test(attr) ? 'xml' : 'js');
      } else {
        super.writeWcmsJs(groupData[attr], path.dirname(attr));
      }
    });
  }

  private ads(config: IConfig) {
    const { key, value, tabName, rowStart, rowEnd } = config;
    const data = super.sheetToAoa(tabName, rowStart, rowEnd);
    const cache = data.map(item => ({ id: item[key], text: item[value] }));
    super.writeAds(cache);
  }
}

new Translate(excelPath);
