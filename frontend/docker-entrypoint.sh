#!/bin/sh
set -e

# Backend service URL (Docker Compose: http://backend:3002, K8s: http://plask-backend:3002)
BACKEND_SVC=${BACKEND_SVC:-http://backend:3002}

# Replace placeholder in nginx config
sed -i "s|BACKEND_SVC_PLACEHOLDER|${BACKEND_SVC}|g" /etc/nginx/conf.d/default.conf

# Generate runtime environment config accessible to the browser
cat > /usr/share/nginx/html/env-config.js <<EOF
window._env_ = {
  API_BASE_URL: "${API_BASE_URL:-}"
};
EOF

echo "Started with BACKEND_SVC=${BACKEND_SVC}"

exec "$@"
