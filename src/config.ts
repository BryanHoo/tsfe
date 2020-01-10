import prettier from 'prettier';
export interface IConfig {
  /**
   * 表名
   */
  tabName: string;
  /**
   * key 值所在列
   */
  key: number;
  /**
   * value 数据所在列
   */
  value: number;
  /**
   * 截取数据开始行
   */
  rowStart: number;
  /**
   * 截取数据结束行
   */
  rowEnd?: number;
  /**
   * 语言简写
   */
  name?: string;
}
export const prettierConfig: prettier.Options = {
  quoteProps: 'consistent',
  tabWidth: 4,
  printWidth: 120,
  parser: 'babel'
};

export const excelPath = '../excel/263.xls';

export const react: IConfig = {
  tabName: 'React',
  key: 0,
  value: 2,
  rowStart: 1,
  name: 'tr-TR'
};

export const reachHandleMethod: IConfig = {
  tabName: 'reachHandleMethod',
  key: 0,
  value: 3,
  rowStart: 1,
  name: 'TR'
};

export const wcms5: IConfig = {
  tabName: 'wcms5',
  key: 0,
  rowStart: 1,
  value: 4
};

export const alarmType: IConfig = {
  tabName: 'Alarmtype',
  key: 1,
  value: 4,
  rowStart: 32
};
