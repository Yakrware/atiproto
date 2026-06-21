#!/usr/bin/env bash
set -euo pipefail

# Deploy packages to npm if their version has been updated.
# After publishing, tags the repo with <package-name>@<version>.
# Usage: npm run deploy [-- --dry-run]

DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
  esac
done

PACKAGES=(
  "packages/lexicons"
  "packages/agent"
  "packages/atproto-attestation"
  "packages/key-resolver"
  "packages/record-resolver"
  "packages/edge-resolvers"
  "packages/kv-oauth-state-store"
  "packages/edge-oauth-client"
  "packages/edge-resolver-cache"
)

# True iff $1 is already in the list of published versions for $2.
# Uses `npm view <name> versions` so beta / pre-release versions count,
# not just whatever is tagged `latest`. Returns "false" for packages
# that have never been published.
is_published() {
  local version="$1"
  local name="$2"
  local json
  json=$(npm view "$name" versions --json 2>/dev/null || echo "")
  [ -z "$json" ] && { echo false; return; }
  node -e "
    const arg = process.argv[1];
    let versions;
    try {
      const v = JSON.parse(arg);
      versions = Array.isArray(v) ? v : [v];
    } catch {
      versions = [];
    }
    console.log(versions.includes(process.argv[2]));
  " "$json" "$version"
}

PUBLISHED=0

for pkg_dir in "${PACKAGES[@]}"; do
  if [ ! -f "$pkg_dir/package.json" ]; then
    continue
  fi

  name=$(node -p "require('./$pkg_dir/package.json').name")
  local_version=$(node -p "require('./$pkg_dir/package.json').version")

  if [ "$(is_published "$local_version" "$name")" = "true" ]; then
    echo "Skipping $name@$local_version (already published)"
    continue
  fi

  echo "Publishing $name@$local_version..."

  npm run build -w "$pkg_dir"

  tag="${name}@${local_version}"

  if [ "$DRY_RUN" = true ]; then
    npm publish -w "$pkg_dir" --dry-run
    echo "[dry-run] Would tag: $tag"
  else
    npm publish -w "$pkg_dir" --access public

    # Tag the repo with package@version
    if git tag "$tag" 2>/dev/null; then
      echo "Tagged $tag"
    else
      echo "Tag $tag already exists, skipping"
    fi
  fi

  PUBLISHED=$((PUBLISHED + 1))
done

if [ "$PUBLISHED" -eq 0 ]; then
  echo "Nothing to deploy — all packages are up to date."
else
  echo "Deployed $PUBLISHED package(s)."
  if [ "$DRY_RUN" = false ]; then
    echo "Push tags with: git push --tags"
  fi
fi
