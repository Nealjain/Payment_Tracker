# Autocomplete Save to Master Fix

## Problem
When creating a new category or UPI ID through the autocomplete input in group expenses, the values were only being set locally but not saved to the database. This meant:
- New categories weren't persisted for future use
- New UPI IDs weren't saved to the user's UPI list
- Users had to manually go to settings to add these items

## Solution
Updated the `onAddNew` callbacks in `app/group-expenses/[id]/page.tsx` to:

### Category Autocomplete
- Makes a POST request to `/api/categories` to save the new category
- Refreshes the categories list after successful save
- Shows appropriate success/error toasts
- Sets the category type as "expense" with a default blue color

### UPI ID Autocomplete
- Validates UPI ID format before saving
- Makes a POST request to `/api/upi` to save the new UPI ID
- Refreshes the UPI IDs list after successful save
- Sets as primary if it's the user's first UPI ID
- Shows appropriate success/error toasts

## Files Modified
- `app/group-expenses/[id]/page.tsx` - Updated both autocomplete `onAddNew` handlers

## API Routes Used
- `POST /api/categories` - Creates new category
- `POST /api/upi` - Creates new UPI ID

Both routes already existed and support the required functionality.

## Testing
1. Go to a group expense page
2. Click "Add Expense"
3. In the Category field, type a new category name and click "Add [name]"
4. The category should be saved and appear in future autocomplete suggestions
5. Select UPI payment method
6. In the UPI ID field, type a new UPI ID (e.g., test@paytm) and click "Add [id]"
7. The UPI ID should be saved and appear in future autocomplete suggestions
8. Verify both items persist across page refreshes and are available in other parts of the app

## Status
✅ Fixed - Categories and UPI IDs now save to master lists when created via autocomplete
