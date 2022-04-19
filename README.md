## 技术栈

react-native、react-navigation、redux、axios

## 构建步骤

``` bash
# 1. 安装依赖
npm install

# 2. 启动本地开发环境，启动后可在真机或模拟器上进行访问
npm run android

npm run ios

# 3. 编译生产环境文件，编译成功再发布到各dev、qa、pre、online等环境
修改```/src/utils/config.js``` 中的defaultEnv为指定环境后，
android: android 目录下执行  gradlew assembleRelease，或者使用Android Studio打包

```

## 代码规范

* 命名上优先使用英文全拼，可适当使用英文缩写，命名应少于20个字符

* js由ESLint监控，提交的代码不应有error，有warning的也尽量修复

* jsx元素中属性的值优先使用单引号包含

* StyleSheet每写一条样式需换行

* StyleSheet中单位数值需使用dp方法进行适配

* 列表查询页已有现成案例，参见```/src/order/Order.js、/src/loan/Loan.js```

* 中文后面的冒号都用中文冒号

* enums.js应只有数据对象，不能有函数、数组

* 没属性的选项都去掉，去除无用代码

* 请求尽量用同步语法

* 文件name命名不要冲突

* 页面编写顺序应按照static>constructor>componentDidMount>方法>render>styles顺序编写，方法使用如下写法：
```
async getCSContractList (data) {
    ...
}
```


## react native debugger的安装

```
macOS:brew update && brew cask install react-native-debugger
详见：https://github.com/jhen0409/react-native-debugger
```

## 发布说明

1.dev193\test\pres环境的包，打完包后，可上传至http://app-manager.qjdidc.com/

2.生产环境包，修改环境变量后，将代码合并到release分支后，根据版本号打tag


### 本地开发如何切换环境？

首先在```/src/utils/config.js```中添加相应环境的代理，然后修改```defaultEnv```的值即可。


### VS Code 有哪些插件需要安装？

ESLint。其他编辑器也需要安装ESLint。

### code push 相关操作说明

请参考：https://www.cnblogs.com/wood-life/p/10691765.html
