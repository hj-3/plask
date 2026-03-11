#!/bin/sh
set -e

# Generate runtime environment config accessible to the browser
cat > /usr/share/nginx/html/env-config.js <<EOF
window._env_ = {
  API_BASE_URL: "${API_BASE_URL:-/api}"
};
EOF

echo "env-config.js generated with API_BASE_URL=${API_BASE_URL:-/api}"

exec "$@"
