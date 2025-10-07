#!/bin/bash

echo "🚀 QUICK CLEAR & RESTART"
echo "========================"
echo ""

# Clear Next.js cache
echo "🧹 Clearing .next cache..."
rm -rf .next
echo "✅ Done"

# Clear node_modules cache
echo "🧹 Clearing node_modules cache..."
rm -rf node_modules/.cache
echo "✅ Done"

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force > /dev/null 2>&1
echo "✅ Done"

echo ""
echo "✨ Cache cleared!"
echo ""
echo "Now run: npm run dev"
echo ""
