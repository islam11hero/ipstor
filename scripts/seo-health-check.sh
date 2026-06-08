#!/usr/bin/env bash
# Weekly SEO baseline — run: bash scripts/seo-health-check.sh
# Mirrors GSC URL Inspection checks for / and /locations/united-states.

set -euo pipefail

PAGES=(
  "https://www.ipnova.online/"
  "https://www.ipnova.online/locations/united-states"
)

echo "=== IP Nova SEO health check — $(date -u +"%Y-%m-%dT%H:%M:%SZ") ==="
echo

echo "--- Host redirect (apex → www) ---"
curl -sSI "https://ipnova.online/" | grep -iE '^(HTTP|location:)'
echo

echo "--- Sitemap (www) ---"
SITEMAP_URL=$(curl -sSL "https://www.ipnova.online/sitemap.xml" | grep -c '<loc>' || true)
SITEMAP_SAMPLE=$(curl -sSL "https://www.ipnova.online/sitemap.xml" | grep -m1 '<loc>' || true)
echo "URLs in sitemap: ${SITEMAP_URL}"
echo "Sample loc: ${SITEMAP_SAMPLE}"
echo

CANONICAL_HOST="https://www.ipnova.online"

for url in "${PAGES[@]}"; do
  echo "--- ${url} ---"
  curl -sSI "${url}" | grep -iE '^(HTTP|x-robots)' || true
  CANONICAL=$(curl -sSL -A "Googlebot" "${url}" \
    | grep -oE '<link[^>]*rel="canonical"[^>]*>' | head -1 || true)
  echo "${CANONICAL}"
  if [[ -n "${CANONICAL}" && "${CANONICAL}" != *"${CANONICAL_HOST}"* ]]; then
    echo "WARNING: canonical does not use ${CANONICAL_HOST}"
  fi
  echo
done

echo "--- Response time (www homepage) ---"
curl -sS -o /dev/null -w "TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" \
  "https://www.ipnova.online/"
