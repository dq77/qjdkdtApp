module.exports = {
  parser: 'babel-eslint',
  env: {
    es6: true,
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],

  rules: {
    /**
     * 这里可以设置规则：
     * "off" or 0 - 关闭规则
     * "warn" or 1 - 将规则作为警告打开（不影响退出代码）
     * "error" or 2 - 将规则作为错误打开（退出代码为1）
     */
    'no-unused-vars': 0, //不能有声明后未被使用的变量或参数
    'react/sort-comp': 1, //强制组件方法顺序
    camelcase: 2, //强制驼峰法命名
    'prettier/prettier': [
      'error',
      // 如果插件配置中修改了相关选项，
      // 则必须在此添加相对应的自定义规则否则就会出现编辑器格式化后ESlint检查无法通过的情况。
      {
        printWidth: 120,
      },
    ],
  },
}
