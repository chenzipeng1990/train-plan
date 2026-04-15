#!/bin/bash

# 构建脚本

echo "开始构建训练计划应用..."

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
  echo "依赖未安装，开始安装..."
  npm install
  if [ $? -ne 0 ]; then
    echo "依赖安装失败，请检查网络连接或package.json文件"
    exit 1
  fi
  echo "依赖安装完成"
fi

# 运行构建命令
echo "执行构建命令..."
npm run build

if [ $? -eq 0 ]; then
  echo "构建成功！"
  echo "构建产物位于 dist 目录"
  echo "可以将 dist 目录的内容部署到静态网站托管服务，如 GitHub Pages、GitLab Pages 等"
else
  echo "构建失败，请检查错误信息"
  exit 1
fi

# 显示构建目录内容
echo "\n构建目录内容："
ls -la dist

echo "\n构建完成！"
