#!/usr/bin/env bash
set -euo pipefail

# Load from .env.whoop if it exists (keeps secrets out of this script)
ENV_FILE="$(dirname "$0")/../.env.whoop"
if [ -f "$ENV_FILE" ]; then
  echo "Loading credentials from .env.whoop"
  # shellcheck source=/dev/null
  source "$ENV_FILE"
fi

# Validate required vars
if [ -z "${WHOOP_CLIENT_ID:-}" ] || [ -z "${WHOOP_CLIENT_SECRET:-}" ]; then
  echo "Missing WHOOP_CLIENT_ID or WHOOP_CLIENT_SECRET."
  echo ""
  echo "Either export them as env vars, or create a .env.whoop file in the repo root:"
  echo ""
  echo '  WHOOP_CLIENT_ID="your-client-id"'
  echo '  WHOOP_CLIENT_SECRET="your-client-secret"'
  echo ""
  exit 1
fi

REDIRECT_URI="http://localhost:3000/callback"
SCOPES="read:recovery%20read:cycles%20read:sleep%20read:workout%20read:profile%20offline"

AUTH_URL="https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${WHOOP_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&state=localauth"

echo "Opening browser for Whoop authorization..."
open "$AUTH_URL" 2>/dev/null || echo "Open this URL manually: $AUTH_URL"

echo "Waiting for callback on http://localhost:3000 ..."

# Start a one-shot HTTP server to capture the OAuth callback
RESPONSE=$(python3 -c "
import http.server, urllib.parse

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        code = params.get('code', [None])[0]
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<h2>Got it! You can close this tab.</h2>')
        if code:
            print(code, flush=True)
        raise KeyboardInterrupt

try:
    http.server.HTTPServer(('', 3000), Handler).serve_forever()
except KeyboardInterrupt:
    pass
")

CODE="$RESPONSE"

if [ -z "$CODE" ]; then
  echo "ERROR: No authorization code received."
  exit 1
fi

echo "Got authorization code. Exchanging for tokens..."

TOKEN_RESPONSE=$(curl -s -X POST https://api.prod.whoop.com/oauth/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=${CODE}" \
  -d "client_id=${WHOOP_CLIENT_ID}" \
  -d "client_secret=${WHOOP_CLIENT_SECRET}" \
  -d "redirect_uri=${REDIRECT_URI}")

REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh_token',''))")

if [ -z "$REFRESH_TOKEN" ]; then
  echo "ERROR: Failed to get refresh token. Response:"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo ""
echo "=== SUCCESS ==="
echo ""

# Automatically set the GitHub secret
echo "Setting WHOOP_REFRESH_TOKEN as GitHub secret..."
echo -n "$REFRESH_TOKEN" | gh secret set WHOOP_REFRESH_TOKEN

echo "Done! WHOOP_REFRESH_TOKEN has been updated in GitHub secrets."
