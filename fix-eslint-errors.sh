#!/bin/bash

# Fix unused React imports in all JSX files
echo "Fixing unused React imports..."

# Find all JSX files with unused React import
find src -name "*.jsx" -type f | while read file; do
  # Check if file has "import React from 'react'" and it's unused
  if grep -q "import React from 'react'" "$file"; then
    # Remove the unused React import
    sed -i "/^import React from 'react';$/d" "$file"
    echo "Fixed: $file"
  fi
done

echo "Done fixing React imports!"