#!/usr/bin/env bash
#
# Build the frontend and publish dist/ to an Oracle Cloud Object Storage bucket.
#
# Prerequisites:
#   - OCI CLI installed and configured (`oci setup config`)
#   - A bucket already created (public, or fronted by a CDN/LB — see DEPLOY_OCI.md)
#
# Usage:
#   OCI_BUCKET=pethotelgo-frontend \
#   OCI_NAMESPACE=grxxxxxxxxxx \
#   [OCI_PREFIX=] \
#   ./scripts/deploy-oci.sh
#
set -euo pipefail

: "${OCI_BUCKET:?set OCI_BUCKET}"
: "${OCI_NAMESPACE:?set OCI_NAMESPACE}"
PREFIX="${OCI_PREFIX:-}"
DIST="dist"

echo "==> Building (production)"
npm ci
npm run build

echo "==> Uploading hashed assets with long-lived immutable cache"
oci os object bulk-upload \
  --namespace "$OCI_NAMESPACE" \
  --bucket-name "$OCI_BUCKET" \
  --src-dir "$DIST/assets" \
  --object-prefix "${PREFIX}assets/" \
  --overwrite \
  --content-type auto \
  --cache-control "public, max-age=31536000, immutable"

echo "==> Uploading the rest (HTML / SW / manifest / icons) with no-cache"
# Everything except assets/ — these must revalidate on every load so a deploy
# takes effect immediately (index.html points at the new hashed bundles, and
# the service worker must never be served stale).
oci os object bulk-upload \
  --namespace "$OCI_NAMESPACE" \
  --bucket-name "$OCI_BUCKET" \
  --src-dir "$DIST" \
  --object-prefix "$PREFIX" \
  --exclude "assets/*" \
  --overwrite \
  --content-type auto \
  --cache-control "no-cache"

echo "==> Done. Remember to purge the CDN cache if you use one."
