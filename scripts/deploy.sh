#!/usr/bin/env bash
set -euo pipefail

# Deploy packages to npm if their version has been updated.
# Usage: npm run deploy [-- --dry-run]

DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
  esac
done

PACKAGES=("packages/lexicons" "packages/agent")
PUBLISHED=0

for pkg_dir in "${PACKAGES[@]}"; do
  name=$(node -p "require('./$pkg_dir/package.json').name")
  local_version=$(node -p "require('./$pkg_dir/package.json').version")

  # Get the published version from npm (empty string if not published yet)
  remote_version=$(npm view "$name" version 2>/dev/null || echo "")

  if [ "$local_version" = "$remote_version" ]; then
    echo "Skipping $name@$local_version (already published)"
    continue
  fi

  echo "Publishing $name@$local_version (registry has ${remote_version:-nothing})..."

  npm run build -w "$pkg_dir"

  if [ "$DRY_RUN" = true ]; then
    npm publish -w "$pkg_dir" --dry-run
  else
    npm publish -w "$pkg_dir" --access public
  fi

  PUBLISHED=$((PUBLISHED + 1))
done

if [ "$PUBLISHED" -eq 0 ]; then
  echo "Nothing to deploy — all packages are up to date."
else
  echo "Deployed $PUBLISHED package(s)."
fi
