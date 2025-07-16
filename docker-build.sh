#!/bin/bash

# Docker构建和部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="ai-homework-frontend"
TAG=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-""}

echo -e "${GREEN}🚀 开始构建 AI作业管理系统 Docker镜像...${NC}"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker未运行，请先启动Docker${NC}"
    exit 1
fi

# 清理旧的构建缓存
echo -e "${YELLOW}🧹 清理构建缓存...${NC}"
docker builder prune -f

# 构建生产镜像
echo -e "${YELLOW}🔨 构建生产镜像...${NC}"
docker build \
    --target production \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    .

# 构建开发镜像
echo -e "${YELLOW}🔨 构建开发镜像...${NC}"
docker build \
    -f Dockerfile.dev \
    --tag ${IMAGE_NAME}:dev \
    .

# 显示镜像信息
echo -e "${GREEN}📊 构建完成的镜像:${NC}"
docker images | grep ${IMAGE_NAME}

# 如果指定了registry，推送镜像
if [ ! -z "$REGISTRY" ]; then
    echo -e "${YELLOW}📤 推送镜像到 ${REGISTRY}...${NC}"
    docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${IMAGE_NAME}:${TAG}
    docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}
fi

echo -e "${GREEN}✅ 构建完成！${NC}"
echo -e "${GREEN}运行命令:${NC}"
echo -e "  生产环境: ${YELLOW}docker run -p 80:80 -p 443:443 ${IMAGE_NAME}:${TAG}${NC}"
echo -e "  开发环境: ${YELLOW}docker run -p 5173:5173 ${IMAGE_NAME}:dev${NC}"
echo -e "  使用compose: ${YELLOW}docker-compose up${NC}"