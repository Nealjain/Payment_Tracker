# Settings Page - Complete User Profile Management

## Overview
Comprehensive settings page allowing users to update all their account information.

## Features Implemented

### 1. Profile Settings
- **Username**: Change display name
- **Email**: Update email address with validation
- **Phone Number**: Update phone with international format support

### 2. Security Settings
- **Password**: Change account password with current password verification
- **PIN**: Update 4-digit PIN for quick access

### 3. Danger Zone
- **Delete All Data**: Permanently delete account and all associated data

## API Endpoints Created

### Profile Updates
- `PUT /api/user/update-username` - Update username
- `PUT /api/user/update-email` - Update email address
- `PUT /api/user/update-phone` - Update phone number

### Security Updates
- `PUT /api/user/update-password` - Change password
- `PUT /api/user/update-pin` - Change PIN

### Data Management
- `DELETE /api/user/delete-all` - Delete all user data (existing)

## Security Features

### Validation
- Username: Max 50 characters, uniqueness check
- Email: Format validation, uniqueness check
- Phone: International format support, uniqueness check
- Password: Min 8 characters, current password verification
- PIN: Exactly 4 digits, current PIN verification

### Authentication
- All endpoints require active session
- Current credentials verified before updates
- Passwords/PINs hashed with bcrypt (12 rounds)

## UI/UX Features

### Tabbed Interface
- **Profile Tab**: Username, email, phone updates
- **Security Tab**: Password and PIN changes
- **Danger Zone Tab**: Account deletion

### User Experience
- Show/hide password/PIN toggles
- Real-time validation feedback
- Success/error toast notifications
- Loading states during updates
- Confirmation dialog for destructive actions

### Design
- PixelBlast animated background
- Glassmorphism cards with backdrop blur
- Responsive layout
- Accessible form controls
- Icon indicators for each section

## Usage

### Update Username
1. Go to Settings → Profile tab
2. Enter new username
3. Click "Update Username"

### Update Email
1. Go to Settings → Profile tab
2. Enter new email address
3. Click "Update Email"

### Update Phone
1. Go to Settings → Profile tab
2. Select country and enter phone number
3. Click "Update Phone"

### Change Password
1. Go to Settings → Security tab
2. Enter current password
3. Enter new password (min 8 characters)
4. Confirm new password
5. Click "Update Password"

### Change PIN
1. Go to Settings → Security tab
2. Enter current 4-digit PIN
3. Enter new 4-digit PIN
4. Confirm new PIN
5. Click "Update PIN"

### Delete Account
1. Go to Settings → Danger Zone tab
2. Click "Delete All Data"
3. Type "DELETE ALL" to confirm
4. Click "Delete All Data" in dialog

## Technical Details

### Dependencies
- react-international-phone: Phone number input with country selection
- bcryptjs: Password/PIN hashing
- Supabase: Database operations

### Database Fields Updated
- `users.username`
- `users.email`
- `users.phone_number`
- `users.pin_hash` (stores both password and PIN)
- `users.updated_at`

### Error Handling
- Duplicate username/email/phone detection
- Invalid format validation
- Incorrect current credentials
- Database operation failures
- Session expiration

## Notes

- Password and PIN both use the `pin_hash` field (consider separating in future)
- Phone number validation relies on international format
- All updates trigger `updated_at` timestamp
- Successful updates refresh user info automatically
- Account deletion logs user out and redirects to auth page
