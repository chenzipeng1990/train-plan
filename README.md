# 训练计划应用

一个用于记录日常训练和体重数据的静态网页应用，支持数据可视化和本地存储。

## 功能特点

- 📅 记录每日训练记录和体重数据
- 📊 体重趋势统计（折线图）
- ✏️ 支持新增、删除训练记录
- 📱 响应式设计，适配手机和桌面设备
- 💾 数据存储在本地浏览器中
- 🏃 用emoji表情表示训练类型

## 技术栈

- Vue 3 + Vite
- Chart.js + vue-chartjs (数据可视化)
- dayjs (日期处理)
- Vue Router (路由管理)
- localStorage (本地存储)

## 快速开始

### 本地开发

1. 克隆项目
   ```bash
   git clone <repository-url>
   cd train-plan
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 `http://localhost:5173`

### 构建部署

1. 运行构建脚本
   ```bash
   bash build.sh
   ```

2. 将 `dist` 目录的内容部署到静态网站托管服务，如：
   - GitHub Pages
   - GitLab Pages
   - Vercel
   - Netlify

## 使用指南

### 训练记录管理

1. **查看训练记录**：进入应用后，默认显示训练记录列表，按日期倒序排列（最新的记录在最前面）。

2. **添加训练记录**：
   - 点击右上角的菜单图标
   - 选择「添加训练记录」
   - 填写日期、训练类型、训练详情和体重
   - 点击「保存」按钮

3. **删除训练记录**：
   - 在手机上长按训练记录项
   - 在弹出的确认对话框中点击「删除」

4. **训练类型**：
   - 跑步 🏃🏻
   - 力量 💪🏻
   - 休息 😴

### 体重趋势统计

1. **查看体重趋势**：
   - 点击右上角的菜单图标
   - 选择「体重趋势」

2. **选择时间范围**：
   - 使用下拉菜单选择年份和月份
   - 系统会自动显示对应月份的体重变化趋势

3. **图表说明**：
   - X轴：日期（按天）
   - Y轴：体重（kg）
   - 折线：体重变化趋势

## 数据存储

- 所有数据存储在浏览器的 localStorage 中
- 数据不会上传到任何服务器
- 清除浏览器缓存或使用隐私模式会导致数据丢失
- 建议定期备份数据

## 项目结构

```
train-plan/
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 组件
│   │   ├── TrainingList.vue    # 训练记录列表
│   │   ├── AddTraining.vue     # 添加训练记录
│   │   └── WeightChart.vue     # 体重趋势图表
│   ├── composables/    # 组合式函数
│   │   └── useTraining.js      # 训练记录逻辑
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── utils/          # 工具函数
│   │   └── storage.js          # 本地存储操作
│   ├── views/          # 页面视图
│   │   ├── HomeView.vue        # 训练记录页面
│   │   └── WeightView.vue      # 体重趋势页面
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/             # 公共文件
├── tests/              # 测试文件
│   └── useTraining.spec.js     # 训练记录逻辑测试
├── build.sh            # 构建脚本
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT
