#!/bin/bash

# Docker运行脚本
set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
IMAGE_NAME="ai-homework-frontend"
CONTAINER_NAME="ai-homework-app"
ENV=${1:-production}

echo -e "${GREEN}🚀 启动 AI作业管理系统...${NC}"

# 停止并删除现有容器
if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo -e "${YELLOW}🛑 停止现有容器...${NC}"
    docker stop ${CONTAINER_NAME} || true
    docker rm ${CONTAINER_NAME} || true
fi

if [ "$ENV" = "development" ] || [ "$ENV" = "dev" ]; then
    echo -e "${YELLOW}🔧 启动开发环境...${NC}"
    docker run -d \
        --name ${CONTAINER_NAME}-dev \
        -p 5173:5173 \
        -v $(pwd):/app \
        -v /app/node_modules \
        -e NODE_ENV=development \
        ${IMAGE_NAME}:dev
    
    echo -e "${GREEN}✅ 开发环境已启动！${NC}"
    echo -e "${GREEN}访问地址: http://localhost:5173${NC}"
else
    echo -e "${YELLOW}🏭 启动生产环境...${NC}"
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p 80:80 \
        -p 443:443 \
        -v $(pwd)/logs:/var/log/nginx \
        -v $(pwd)/ssl:/etc/nginx/ssl:ro \
        -e NODE_ENV=production \
        --restart unless-stopped \
        ${IMAGE_NAME}:latest
    
    echo -e "${GREEN}✅ 生产环境已启动！${NC}"
    echo -e "${GREEN}访问地址: http://localhost${NC}"
    echo -e "${GREEN}HTTPS地址: https://localhost${NC}"
fi

# 显示容器状态
echo -e "${YELLOW}📊 容器状态:${NC}"
docker ps | grep ${IMAGE_NAME}

# 显示日志
echo -e "${YELLOW}📝 实时日志 (Ctrl+C退出):${NC}"
sleep 2
docker logs -f ${CONTAINER_NAME}${ENV:+-dev} 2>/dev/null || docker logs -f ${CONTAINER_NAME}