# Excel 翻译导入工具

## 使用指南

1. 在 `cache` 文件夹放入原 `enums.js`和`i18next.js`
2. 对应 Excel 数据进行配置文件修改

```
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
```

3. 运行 `npm run build`
4. `dist` 内生成的新文件替换需要替换的文件

## 需要替换的文件

wcms5

- www/locale 添加对应语言的 lang.ini.js 文件
- www/jump.html transLang 函数添加对应语言字段
- www/common/app-config.js LANGSRC 数组添加对应语言字段及路径
- wcms4.sql 替换 中心和系统配置管理员字段 Center System Adminstrator
- www/third-resource/metronic47/global/plugins/bootstrap-datepicker/locales
- www/third-resource/metronic47/global/plugins/jquery-validation/js/localization
- www/third-resource/lava-player/LavaPlayer.swf

react

- clent/src/utils/i18next.js
- clent/src/utils/enums.js
- server/server-utils/enums.js
