#!/usr/bin/env bash
# Copy design images from the task pack into Next.js public/ so /assets/images/* resolves at runtime.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/Selection Task for Full Stack Engineer at Appifylab/assets/images"
DST="$ROOT/public/assets/images"
if [[ ! -d "$SRC" ]]; then
  echo "Missing source folder: $SRC" >&2
  exit 1
fi
mkdir -p "$DST"
cp -f "$SRC"/* "$DST"/
n="$(ls -1 "$SRC" | wc -l | tr -d ' ')"
echo "Synced $n files → public/assets/images"
