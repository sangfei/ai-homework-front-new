#!/bin/bash

# Docker运行脚本
set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
IMAGE_NAME="ai-homework-frontend"
CONTAINER_NAME="ai-homework-app"
ENV=${1:-production}

echo -e "${GREEN}🚀 启动 AI作业管理系统...${NC}"

# 检查镜像是否存在
if ! docker images ${IMAGE_NAME} --format "table {{.Repository}}:{{.Tag}}" | grep -q "${IMAGE_NAME}"; then
    echo -e "${RED}❌ 镜像 ${IMAGE_NAME} 不存在，请先运行构建脚本${NC}"
    echo -e "${YELLOW}运行: ./docker-build.sh${NC}"
    exit 1
fi

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
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待开发服务器启动...${NC}"
    sleep 5
    
    # 检查容器状态
    if docker ps | grep -q "${CONTAINER_NAME}-dev"; then
        echo -e "${GREEN}🎉 开发服务器运行正常${NC}"
    else
        echo -e "${RED}❌ 开发服务器启动失败${NC}"
        docker logs ${CONTAINER_NAME}-dev
        exit 1
    fi
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
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待Web服务器启动...${NC}"
    sleep 3
    
    # 检查容器状态
    if docker ps | grep -q "${CONTAINER_NAME}"; then
        echo -e "${GREEN}🎉 Web服务器运行正常${NC}"
        
        # 测试HTTP访问
        if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
            echo -e "${GREEN}✅ HTTP服务正常${NC}"
        else
            echo -e "${YELLOW}⚠️ HTTP服务可能需要更多时间启动${NC}"
        fi
    else
        echo -e "${RED}❌ Web服务器启动失败${NC}"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
fi

# 显示容器状态
echo -e "${YELLOW}📊 容器状态:${NC}"
docker ps | grep ${IMAGE_NAME}

# 显示日志选项
echo -e "${YELLOW}📝 查看日志命令:${NC}"
if [ "$ENV" = "development" ] || [ "$ENV" = "dev" ]; then
    echo -e "  实时日志: ${GREEN}docker logs -f ${CONTAINER_NAME}-dev${NC}"
else
    echo -e "  实时日志: ${GREEN}docker logs -f ${CONTAINER_NAME}${NC}"
fi