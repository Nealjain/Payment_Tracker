#!/bin/bash

echo "🧹 CLEAR CACHE & RECHECK EVERYTHING"
echo "===================================="
echo ""

# Function to print colored output
print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

print_info() {
    echo "ℹ️  $1"
}

print_warning() {
    echo "⚠️  $1"
}

# Step 1: Clear Next.js cache
echo "1️⃣ Clearing Next.js cache..."
if [ -d ".next" ]; then
    rm -rf .next
    print_success "Deleted .next folder"
else
    print_info ".next folder doesn't exist (already clean)"
fi

# Step 2: Clear node_modules cache
echo ""
echo "2️⃣ Clearing node_modules cache..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_success "Deleted node_modules/.cache"
else
    print_info "node_modules/.cache doesn't exist"
fi

# Step 3: Clear npm cache
echo ""
echo "3️⃣ Clearing npm cache..."
npm cache clean --force 2>&1 | grep -v "npm WARN"
print_success "npm cache cleared"

# Step 4: Check environment variables
echo ""
echo "4️⃣ Checking environment variables..."
if [ -f .env.local ]; then
    print_success ".env.local exists"
    
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SESSION_SECRET")
    all_vars_present=true
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            print_success "$var is set"
        else
            print_error "$var is MISSING"
            all_vars_present=false
        fi
    done
    
    if [ "$all_vars_present" = false ]; then
        print_warning "Some environment variables are missing!"
        echo "   Run: cp .env.example .env.local and fill in the values"
    fi
else
    print_error ".env.local does NOT exist"
    echo "   Run: cp .env.example .env.local and fill in the values"
fi

# Step 5: Reinstall dependencies
echo ""
echo "5️⃣ Reinstalling dependencies..."
print_info "Running: npm install"
npm install --silent 2>&1 | tail -5

if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 6: TypeScript check
echo ""
echo "6️⃣ Checking TypeScript..."
print_info "Running: npx tsc --noEmit"
tsc_output=$(npx tsc --noEmit 2>&1)

if [ -z "$tsc_output" ]; then
    print_success "No TypeScript errors"
else
    print_error "TypeScript errors found:"
    echo "$tsc_output" | head -20
fi

# Step 7: Build check
echo ""
echo "7️⃣ Testing build..."
print_info "Running: npm run build"
build_output=$(npm run build 2>&1)

if echo "$build_output" | grep -q "Compiled successfully"; then
    print_success "Build successful"
elif echo "$build_output" | grep -q "Compiled with warnings"; then
    print_warning "Build completed with warnings (this is usually okay)"
else
    print_error "Build failed"
    echo "$build_output" | tail -30
    exit 1
fi

# Step 8: Check key files
echo ""
echo "8️⃣ Verifying key files..."
key_files=(
    "app/auth/page.tsx"
    "app/api/auth/signin/route.ts"
    "app/api/auth/signup/route.ts"
    "app/api/auth/check-email/route.ts"
    "middleware.ts"
    "lib/session.ts"
    "lib/auth.ts"
)

all_files_present=true
for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file"
    else
        print_error "$file MISSING"
        all_files_present=false
    fi
done

# Final summary
echo ""
echo "=================================="
echo "🎯 FINAL SUMMARY"
echo "=================================="

if [ "$all_vars_present" = true ] && [ "$all_files_present" = true ] && [ -z "$tsc_output" ]; then
    echo ""
    print_success "ALL CHECKS PASSED! 🎉"
    echo ""
    echo "Your app is ready to run!"
    echo ""
    echo "Next steps:"
    echo "  1. Start dev server: npm run dev"
    echo "  2. Open browser: http://localhost:3000/auth"
    echo "  3. Open console: F12 → Console tab"
    echo "  4. Test the auth flow"
    echo ""
else
    echo ""
    print_warning "SOME ISSUES FOUND"
    echo ""
    echo "Please fix the issues above before running the app."
    echo ""
fi

echo "For more help, see: CURRENT_STATUS.md"
echo ""
