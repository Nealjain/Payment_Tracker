# Scripts Guide

This project includes several helper scripts to make development easier.

## 🧹 clear-and-check.sh (RECOMMENDED)

**Full cache clear and comprehensive system check**

```bash
./clear-and-check.sh
```

### What it does:
1. ✅ Clears `.next` folder
2. ✅ Clears `node_modules/.cache`
3. ✅ Clears npm cache
4. ✅ Checks environment variables
5. ✅ Reinstalls dependencies
6. ✅ Runs TypeScript check
7. ✅ Tests build
8. ✅ Verifies all key files exist

### When to use:
- After pulling new changes
- When experiencing weird errors
- Before deploying
- When things just aren't working

### Output:
You'll see colored output with ✅ for success, ❌ for errors, and ⚠️ for warnings.

---

## ⚡ quick-clear.sh

**Fast cache clear only**

```bash
./quick-clear.sh
```

### What it does:
1. Clears `.next` folder
2. Clears `node_modules/.cache`
3. Clears npm cache

### When to use:
- Quick refresh during development
- When you just need to clear caches
- Before running `npm run dev`

### After running:
```bash
npm run dev
```

---

## 🔍 check-errors.sh

**Quick error check without clearing cache**

```bash
./check-errors.sh
```

### What it does:
1. Checks environment variables
2. Runs TypeScript check (first 20 errors)
3. Verifies node_modules exists
4. Checks key files exist

### When to use:
- Quick health check
- Before committing code
- To see if there are any obvious issues

---

## 📊 Comparison

| Script | Clears Cache | Checks Env | TypeScript | Build Test | Reinstalls | Time |
|--------|--------------|------------|------------|------------|------------|------|
| `clear-and-check.sh` | ✅ | ✅ | ✅ | ✅ | ✅ | ~2-3 min |
| `quick-clear.sh` | ✅ | ❌ | ❌ | ❌ | ❌ | ~5 sec |
| `check-errors.sh` | ❌ | ✅ | ✅ | ❌ | ❌ | ~30 sec |

---

## 🎯 Recommended Workflow

### Starting fresh:
```bash
./clear-and-check.sh
npm run dev
```

### During development:
```bash
# If you encounter issues:
./quick-clear.sh
npm run dev
```

### Before committing:
```bash
./check-errors.sh
# Fix any errors shown
git add -A
git commit -m "your message"
git push
```

### Before deploying:
```bash
./clear-and-check.sh
# Make sure all checks pass
npm run build
# Deploy if successful
```

---

## 🐛 Troubleshooting

### "Permission denied"
Make scripts executable:
```bash
chmod +x clear-and-check.sh quick-clear.sh check-errors.sh
```

### Scripts not found
Make sure you're in the project root directory:
```bash
pwd  # Should show your project path
ls *.sh  # Should list the scripts
```

### Build fails
Run the full check:
```bash
./clear-and-check.sh
```
It will show you exactly what's wrong.

### Environment variables missing
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your values
3. Run check again:
   ```bash
   ./check-errors.sh
   ```

---

## 💡 Tips

1. **Always clear cache first** when debugging weird issues
2. **Run full check** after pulling changes from git
3. **Use quick-clear** during active development
4. **Check errors** before committing code
5. **Keep console open** (F12) to see runtime logs

---

## 📝 Manual Commands

If you prefer to run commands manually:

### Clear cache:
```bash
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force
```

### Check TypeScript:
```bash
npx tsc --noEmit
```

### Test build:
```bash
npm run build
```

### Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

---

## 🆘 Need Help?

If scripts don't solve your issue:
1. Check `CURRENT_STATUS.md` for detailed status
2. Check `TEST_AUTH_FLOW.md` for auth testing
3. Look at console logs (F12 → Console)
4. Share the error output with your team
