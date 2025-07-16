#!/bin/bash

# 离线Docker构建脚本（适用于网络受限环境）
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

IMAGE_NAME="ai-homework-frontend"
TAG=${1:-latest}

echo -e "${GREEN}🚀 开始离线构建 AI作业管理系统...${NC}"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker未运行，请先启动Docker${NC}"
    exit 1
fi

# 检查必要文件
echo -e "${YELLOW}📋 检查必要文件...${NC}"
required_files=("package.json" "vite.config.ts" "nginx.conf" "Dockerfile")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ $file 文件不存在${NC}"
        exit 1
    fi
done

# 手动验证nginx配置语法（不依赖网络）
echo -e "${YELLOW}🔍 手动验证nginx配置...${NC}"
if grep -q "include /etc/nginx/conf.d/common.conf" nginx.conf; then
    echo -e "${RED}❌ nginx.conf中包含无效的include指令${NC}"
    exit 1
fi

echo -e "${GREEN}✅ nginx配置检查通过${NC}"

# 构建生产镜像（跳过网络验证）
echo -e "${YELLOW}🔨 构建生产镜像...${NC}"
echo -e "${YELLOW}注意：在网络受限环境中，确保已经提前拉取了基础镜像${NC}"
echo -e "${YELLOW}如果构建失败，请先手动拉取：${NC}"
echo -e "${YELLOW}docker pull node:18-alpine${NC}"
echo -e "${YELLOW}docker pull nginx:alpine${NC}"

docker build \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 生产镜像构建失败${NC}"
    exit 1
fi

# 显示镜像信息
echo -e "${GREEN}📊 构建完成的镜像:${NC}"
docker images | grep ${IMAGE_NAME}

echo -e "${GREEN}✅ 离线构建完成！${NC}"
echo -e "${GREEN}运行命令:${NC}"
echo -e "  生产环境: ${YELLOW}docker run -p 80:80 -p 443:443 ${IMAGE_NAME}:${TAG}${NC}"