#!/bin/bash

echo "Setting up transit-live-map..."
echo ""

# API
if [ ! -f api/.env ]; then
  cp api/.env.example api/.env
  echo "✓ Created api/.env"
else
  echo "→ api/.env already exists, skipping"
fi

# Web
if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  echo "✓ Created web/.env"
else
  echo "→ web/.env already exists, skipping"
fi

# Web development
if [ ! -f web/.env.development ]; then
  cp web/.env.example.development web/.env.development
  echo "✓ Created web/.env.development"
else
  echo "→ web/.env.development already exists, skipping"
fi

echo "Installing git hooks..."
if command -v lefthook &> /dev/null; then
  lefthook install
  echo "✓ Git hooks installed"
else
  echo "⚠ Lefthook not found. Install it with: brew install lefthook"
  echo "  Then run: lefthook install"
fi

echo ""
echo "Next steps:"
echo "  1. Add your MBTA_API_KEY to api/.env"
echo "  2. Add your VITE_MAPTILER_KEY to web/.env"
echo "  3. Add your VITE_MAPTILER_KEY to web/.env.development"
echo "  4. Run 'cd api && npm install && npm run dev'"
echo "  5. Run 'cd web && npm install && npm run dev'"
echo ""
echo "Done! See README.md for full setup instructions."