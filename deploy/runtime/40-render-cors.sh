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

if [ -z "${CORS_ALLOWED_ORIGIN_REGEX:-}" ]; then
    echo "ERROR: CORS_ALLOWED_ORIGIN_REGEX must be set" >&2
    exit 1
fi

export CORS_REGEX="$CORS_ALLOWED_ORIGIN_REGEX"
awk '
    {
        line = $0
        while (match(line, /\{\{CORS_ALLOWED_ORIGIN_REGEX\}\}/)) {
            printf "%s%s", substr(line, 1, RSTART - 1), ENVIRON["CORS_REGEX"]
            line = substr(line, RSTART + RLENGTH)
        }
        print line
    }
' "$TEMPLATE" > "$OUTPUT"

echo "CORS configuration rendered from template"
echo "Using regex: $CORS_ALLOWED_ORIGIN_REGEX"