#!/bin/sh

# Render CORS configuration from template
# This script runs at container startup via docker-entrypoint.d

set -e

TEMPLATE="/opt/csp-runtime/cors-origin.conf.template"
OUTPUT="/opt/csp-runtime/cors-origin.conf"

if [ ! -f "$TEMPLATE" ]; then
    echo "ERROR: Template not found at $TEMPLATE" >&2
    exit 1
fi

# Get the regex from environment (with default)
CORS_REGEX="${CORS_ALLOWED_ORIGIN_REGEX:-^http://localhost:420[0-5]$}"

# Escape special characters for sed
ESCAPED_REGEX=$(printf '%s\n' "$CORS_REGEX" | sed 's/[[\.*^$()+?{|\\]/\\&/g')

# Render template
sed "s/{{CORS_ALLOWED_ORIGIN_REGEX}}/$ESCAPED_REGEX/g" "$TEMPLATE" > "$OUTPUT"

echo "CORS configuration rendered from template"
echo "Using regex: $CORS_REGEX"