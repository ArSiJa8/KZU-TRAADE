#!/bin/bash

# Get the list of last 20 commit hashes
COMMITS=$(git log --oneline -n 20 | awk '{print $1}')

for SHA in $COMMITS; do
  echo "Testing commit: $SHA"
  git checkout $SHA --quiet
  
  # Try pnpm install, if it fails, move to next commit
  if ! pnpm install --silent; then
    echo "pnpm install failed for $SHA"
    continue
  fi
  
  # Try pnpm build
  if pnpm build; then
    echo "SUCCESS: pnpm build worked for $SHA"
    # We found it!
    exit 0
  else
    echo "FAILURE: pnpm build failed for $SHA"
  fi
done

echo "No stable commit found in the last 20 commits."
exit 1
