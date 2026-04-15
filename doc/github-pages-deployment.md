# 部署到 GitHub Pages 指南

本指南将详细介绍如何将训练计划应用部署到 GitHub Pages。

## 准备工作

### 1. 确保项目已完成构建

在部署前，确保项目已经成功构建：

```bash
# 运行构建脚本
bash build.sh

# 或手动运行构建命令
npm run build
```

构建成功后，会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

### 2. 确保项目已初始化 Git 仓库

如果项目还没有初始化 Git 仓库，请执行以下命令：

```bash
# 初始化 Git 仓库
git init

# 添加远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin https://github.com/your-username/train-plan.git
```

## 部署方法

### 方法一：使用 GitHub Actions 自动部署（推荐）

1. **创建 GitHub Actions 工作流文件**

   在项目根目录创建 `.github/workflows` 文件夹，并创建 `deploy.yml` 文件：

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]  # 监听 main 分支的推送

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm install
         - name: Build project
           run: npm run build
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **配置 GitHub 仓库设置**

   - 打开你的 GitHub 仓库
   - 进入 `Settings` > `Pages`
   - 在 `Source` 选项中，选择 `GitHub Actions`

3. **推送代码**

   ```bash
   # 添加所有文件
   git add .

   # 提交代码
   git commit -m "Add GitHub Actions workflow for deployment"

   # 推送到 GitHub
   git push origin main
   ```

4. **查看部署状态**

   - 进入 GitHub 仓库的 `Actions` 标签页
   - 查看部署工作流的运行状态
   - 部署完成后，会显示部署成功的消息

### 方法二：手动部署

1. **创建 gh-pages 分支**

   ```bash
   # 创建并切换到 gh-pages 分支
   git checkout -b gh-pages

   # 清空分支内容
   git rm -rf .
   ```

2. **复制构建产物**

   ```bash
   # 复制 dist 目录的内容到当前分支
   cp -r dist/* .

   # 创建 .nojekyll 文件，防止 GitHub Pages 忽略下划线开头的文件
   touch .nojekyll
   ```

3. **提交并推送**

   ```bash
   # 添加文件
   git add .

   # 提交代码
   git commit -m "Deploy to GitHub Pages"

   # 推送到 GitHub
   git push origin gh-pages
   ```

4. **配置 GitHub 仓库设置**

   - 打开你的 GitHub 仓库
   - 进入 `Settings` > `Pages`
   - 在 `Source` 选项中，选择 `gh-pages` 分支
   - 点击 `Save` 按钮

## 配置项目基础路径

如果你的 GitHub Pages 是通过仓库名称访问的（例如 `https://your-username.github.io/train-plan/`），需要修改项目的基础路径：

1. **修改 vite.config.js 文件**

   ```javascript
   // vite.config.js
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'

   export default defineConfig({
     plugins: [vue()],
     base: '/train-plan/'  // 替换为你的仓库名称
   })
   ```

2. **重新构建项目**

   ```bash
   npm run build
   ```

3. **重新部署**

   按照上述部署方法重新部署项目。

## 验证部署

部署完成后，访问以下地址验证应用是否成功部署：

- 如果是用户/组织页面：`https://your-username.github.io/`
- 如果是仓库页面：`https://your-username.github.io/train-plan/`

## 常见问题及解决方案

### 1. 404 错误

**原因**：GitHub Pages 可能还在处理部署，或者路径配置错误。

**解决方案**：
- 等待几分钟后再次访问
- 检查基础路径配置是否正确
- 确保 gh-pages 分支存在且包含正确的文件

### 2. 页面空白或资源加载失败

**原因**：静态资源路径错误。

**解决方案**：
- 检查 vite.config.js 中的 base 配置
- 确保构建产物中的资源路径正确

### 3. GitHub Actions 部署失败

**原因**：可能是依赖安装失败或构建错误。

**解决方案**：
- 查看 Actions 日志，了解具体错误信息
- 确保 package.json 中的依赖配置正确
- 尝试在本地运行构建命令，确保构建成功

### 4. 图片或字体等静态资源不显示

**原因**：资源路径配置错误。

**解决方案**：
- 确保资源文件放在 public 目录或正确导入
- 检查资源路径是否使用了相对路径

## 自动化部署最佳实践

1. **使用 GitHub Actions**：推荐使用 GitHub Actions 自动部署，减少手动操作
2. **设置分支保护**：对 main 分支设置保护，确保只有经过审查的代码才能部署
3. **添加部署状态徽章**：在 README.md 中添加部署状态徽章，方便查看部署状态
4. **定期备份数据**：由于数据存储在 localStorage 中，建议定期备份重要数据

## 总结

通过本指南，你应该能够成功将训练计划应用部署到 GitHub Pages。部署完成后，你可以通过 GitHub Pages 提供的 URL 访问应用，开始记录和管理你的训练计划。

如果遇到任何问题，请参考常见问题部分，或查阅 GitHub Pages 的官方文档。
