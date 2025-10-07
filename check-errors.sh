#!/bin/bash

echo "🔍 Checking for errors in the codebase..."
echo ""

# Check if .env.local exists
echo "1️⃣ Checking environment variables..."
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    
    # Check required variables
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SESSION_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            echo "✅ $var is set"
        else
            echo "❌ $var is MISSING"
        fi
    done
else
    echo "❌ .env.local does NOT exist"
fi

echo ""
echo "2️⃣ Checking TypeScript compilation..."
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "3️⃣ Checking for common issues..."

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - run: npm install"
fi

# Check if package.json exists
if [ -f package.json ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
fi

echo ""
echo "4️⃣ Key files check..."
key_files=(
    "app/auth/page.tsx"
    "app/api/auth/signin/route.ts"
    "app/api/auth/signup/route.ts"
    "app/api/auth/check-email/route.ts"
    "middleware.ts"
    "lib/session.ts"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file MISSING"
    fi
done

echo ""
echo "✨ Check complete!"
echo ""
echo "To run the dev server: npm run dev"
echo "To check for more errors: npm run build"
