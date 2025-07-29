#!/bin/bash

# Build and publish GuardAnt Worker standalone image

VERSION=${1:-latest}
REGISTRY=${2:-ghcr.io/m00npl}

echo "🚀 Building GuardAnt Worker v$VERSION"

# Build image
docker build -t guardant-worker:$VERSION .
docker tag guardant-worker:$VERSION $REGISTRY/guardant-worker:$VERSION
docker tag guardant-worker:$VERSION $REGISTRY/guardant-worker:latest

echo "📦 Tagged images:"
echo "  - $REGISTRY/guardant-worker:$VERSION"
echo "  - $REGISTRY/guardant-worker:latest"

# Push to registry (requires authentication)
read -p "Push to registry? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker push $REGISTRY/guardant-worker:$VERSION
    docker push $REGISTRY/guardant-worker:latest
    echo "✅ Pushed to registry"
fi