#!/bin/bash

# Build and push multi-architecture Docker image for GuardAnt Worker
# Supports: linux/amd64, linux/arm64, linux/arm/v7 (for older Raspberry Pi)

set -e

# Configuration
DOCKER_REPO="moonplkr/guardant-worker"
VERSION="6.4.0"
PLATFORMS="linux/amd64,linux/arm64,linux/arm/v7"

echo "🚀 Building multi-architecture GuardAnt Worker image v${VERSION}"

# Ensure buildx is available
docker buildx version > /dev/null 2>&1 || {
    echo "❌ Docker buildx not found. Please update Docker."
    exit 1
}

# Create and use buildx builder
BUILDER_NAME="guardant-multiarch"
if ! docker buildx ls | grep -q ${BUILDER_NAME}; then
    echo "📦 Creating buildx builder: ${BUILDER_NAME}"
    docker buildx create --name ${BUILDER_NAME} --use
    docker buildx inspect --bootstrap
else
    echo "📦 Using existing buildx builder: ${BUILDER_NAME}"
    docker buildx use ${BUILDER_NAME}
fi

# Build and push multi-arch image
echo "🔨 Building for platforms: ${PLATFORMS}"
docker buildx build \
    --platform ${PLATFORMS} \
    --tag ${DOCKER_REPO}:${VERSION} \
    --tag ${DOCKER_REPO}:latest \
    --file Dockerfile.multiarch \
    --push \
    .

echo "✅ Multi-architecture image pushed successfully!"
echo "   Repository: ${DOCKER_REPO}"
echo "   Version: ${VERSION}"
echo "   Platforms: ${PLATFORMS}"

# Test the manifest
echo ""
echo "📋 Image manifest:"
docker manifest inspect ${DOCKER_REPO}:${VERSION} | grep -E "(architecture|os)" | head -20

echo ""
echo "🎉 Done! Users can now pull the image on any supported platform:"
echo "   docker pull ${DOCKER_REPO}:${VERSION}"
echo ""
echo "   AMD64 (x86_64): ✅"
echo "   ARM64 (Raspberry Pi 4/5, Apple Silicon): ✅"
echo "   ARMv7 (Raspberry Pi 2/3): ✅"