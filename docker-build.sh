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

# 检查网络连接
echo -e "${YELLOW}🌐 检查网络连接...${NC}"
if ! ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ 网络连接可能有问题，但继续构建...${NC}"
fi

# 检查必要文件是否存在
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json文件不存在${NC}"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo -e "${RED}❌ vite.config.ts文件不存在${NC}"
    exit 1
fi

if [ ! -f "nginx.conf" ]; then
    echo -e "${RED}❌ nginx.conf文件不存在${NC}"
    exit 1
fi

# 验证nginx配置语法（跳过网络问题）
echo -e "${YELLOW}🔍 验证nginx配置语法...${NC}"

# 方法1：尝试使用本地nginx镜像
if docker images nginx:alpine --format "table {{.Repository}}:{{.Tag}}" | grep -q "nginx:alpine"; then
    echo -e "${GREEN}✅ 使用本地nginx镜像验证配置${NC}"
    docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ nginx配置语法错误${NC}"
        exit 1
    fi
else
    # 方法2：尝试拉取nginx镜像，如果失败则跳过验证
    echo -e "${YELLOW}⏬ 尝试拉取nginx镜像进行配置验证...${NC}"
    if docker pull nginx:alpine > /dev/null 2>&1; then
        docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ nginx配置语法错误${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ nginx配置语法正确${NC}"
    else
        echo -e "${YELLOW}⚠️ 无法拉取nginx镜像，跳过配置验证（构建时会验证）${NC}"
    fi
fi

# 构建生产镜像
echo -e "${YELLOW}🔨 构建生产镜像...${NC}"
docker build \
    --target production \
    --tag ${IMAGE_NAME}:${TAG} \
    --tag ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    --progress=plain \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 生产镜像构建失败${NC}"
    exit 1
fi

# 构建开发镜像
echo -e "${YELLOW}🔨 构建开发镜像...${NC}"
docker build \
    -f Dockerfile.dev \
    --tag ${IMAGE_NAME}:dev \
    --progress=plain \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 开发镜像构建失败${NC}"
    exit 1
fi

# 显示镜像信息
echo -e "${GREEN}📊 构建完成的镜像:${NC}"
docker images | grep ${IMAGE_NAME}

# 验证镜像可以正常启动
echo -e "${YELLOW}🧪 测试镜像启动...${NC}"
CONTAINER_ID=$(docker run -d -p 8080:80 ${IMAGE_NAME}:${TAG})
sleep 3

if docker ps | grep -q ${CONTAINER_ID}; then
    echo -e "${GREEN}✅ 镜像启动测试成功${NC}"
    docker stop ${CONTAINER_ID} > /dev/null
    docker rm ${CONTAINER_ID} > /dev/null
else
    echo -e "${RED}❌ 镜像启动测试失败${NC}"
    docker logs ${CONTAINER_ID}
    docker rm ${CONTAINER_ID} > /dev/null
    exit 1
fi

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