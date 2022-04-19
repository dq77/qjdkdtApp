module.exports = {
  printWidth: 120, //一行的字符数，如果超过会进行换行，默认为80
  tabWidth: 2, //一个tab代表几个空格数
  useTabs: false, //是否使用tab进行缩进，默认为false，表示用空格进行缩减
  singleQuote: true, //字符串是否使用单引号，默认为false，使用双引号
  semi: false, //行位是否使用分号，默认为true
  trailingComma: 'all', //是否使用尾逗号，有三个可选值"<none|es5|all>"
  bracketSpacing: true, //对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  wrapAttributes: false, //强制换行属性（当它有多个时，默认值为false）
  sortAttributes: true, //按字母顺序排序属性（默认值：false）
  jsxBracketSameLine: false, // //将>多行JSX元素放在最后一行的末尾，而不是单独放在下一行
  arrowParens: 'avoid', //箭头函数参数只有一个时是否要有小括号
  endOfLine: 'auto', // 兼容Mac与Windows文本文件换行符的序列监测规则
}
