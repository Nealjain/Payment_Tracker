# Smart Onboarding & Customization System - Implementation Plan

## 📋 Overview
Transform your Payment Tracker into an adaptive, personalized finance platform with intelligent onboarding.

## 🏗️ Architecture

### Database Schema Updates
```sql
-- Add user_preferences table
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Profile
  user_type varchar NOT NULL CHECK (user_type IN ('professional', 'freelancer', 'homemaker', 'student', 'retired', 'other')),
  currency varchar DEFAULT 'INR',
  locale varchar DEFAULT 'en-IN',
  
  -- Preferences JSON
  focus_areas jsonb DEFAULT '[]'::jsonb,
  income_type varchar,
  income_frequency varchar,
  expense_categories jsonb DEFAULT '[]'::jsonb,
  budget_style varchar,
  tracking_method varchar,
  notifications jsonb DEFAULT '[]'::jsonb,
  sharing_option varchar DEFAULT 'only_me',
  biometric_lock boolean DEFAULT false,
  theme_preference varchar DEFAULT 'auto',
  dashboard_layout varchar DEFAULT 'graphical',
  
  -- Modules
  modules_enabled jsonb DEFAULT '{}'::jsonb,
  dashboard_widgets jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  onboarding_completed boolean DEFAULT false,
  onboarding_completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
```

## 📁 File Structure

```
app/
├── onboarding/
│   ├── page.tsx                    # Main onboarding flow
│   └── layout.tsx                  # Onboarding layout
├── dashboard/
│   ├── page.tsx                    # Dynamic dashboard (updated)
│   └── customize/
│       └── page.tsx                # Dashboard customization
components/
├── onboarding/
│   ├── welcome-step.tsx            # Step 1: Welcome
│   ├── user-type-step.tsx          # Step 2: User type selection
│   ├── focus-areas-step.tsx        # Step 3: Focus areas
│   ├── income-details-step.tsx     # Step 4: Income details
│   ├── expense-categories-step.tsx # Step 5: Expense categories
│   ├── budget-style-step.tsx       # Step 6: Budget preferences
│   ├── tracking-method-step.tsx    # Step 7: Tracking method
│   ├── notifications-step.tsx      # Step 8: Notifications
│   ├── privacy-step.tsx            # Step 9: Privacy & sharing
│   ├── appearance-step.tsx         # Step 10: Theme & layout
│   └── preview-step.tsx            # Step 11: Dashboard preview
├── dashboard/
│   ├── widget-balance.tsx          # Balance widget
│   ├── widget-spending.tsx         # Spending widget
│   ├── widget-income.tsx           # Income widget
│   ├── widget-bills.tsx            # Bills widget
│   ├── widget-goals.tsx            # Goals widget
│   ├── widget-budget.tsx           # Budget widget
│   ├── widget-insights.tsx         # Insights widget
│   ├── widget-transactions.tsx     # Recent transactions
│   └── widget-container.tsx        # Widget wrapper
lib/
├── types/
│   └── onboarding.ts               # TypeScript types ✅ CREATED
├── onboarding-logic.ts             # Personalization engine ✅ CREATED
├── api/
│   └── preferences.ts              # Preferences API client
hooks/
├── use-onboarding.ts               # Onboarding state management
└── use-preferences.ts              # User preferences hook
```

## 🎯 Implementation Steps

### Phase 1: Database & Types ✅
- [x] Create TypeScript types
- [x] Create onboarding logic engine
- [ ] Run database migration
- [ ] Create API routes

### Phase 2: Onboarding Flow
- [ ] Create onboarding step components
- [ ] Build main onboarding page
- [ ] Add progress tracking
- [ ] Implement skip/back navigation
- [ ] Add data persistence

### Phase 3: Dynamic Dashboard
- [ ] Create widget components
- [ ] Build widget container system
- [ ] Implement drag-and-drop reordering
- [ ] Add widget enable/disable
- [ ] Create dashboard customization page

### Phase 4: Personalization Engine
- [ ] Implement smart recommendations
- [ ] Add A/B testing for layouts
- [ ] Create insights based on user type
- [ ] Build notification system
- [ ] Add preference sync

### Phase 5: Settings & Modifications
- [ ] Create settings page
- [ ] Add preference editing
- [ ] Implement re-onboarding option
- [ ] Add export/import preferences
- [ ] Build profile switching

## 🎨 UI/UX Guidelines

### Onboarding Flow
- **Progress bar** at top showing completion %
- **Back button** on all steps except welcome
- **Skip button** available (saves partial data)
- **Smooth transitions** between steps
- **Visual feedback** for selections
- **Mobile-first** responsive design

### Dashboard Widgets
- **Modular cards** with consistent styling
- **Drag handles** for reordering
- **Settings icon** for widget config
- **Loading states** for async data
- **Empty states** with helpful CTAs
- **Responsive grid** layout

### Color Coding by User Type
- Professional: Blue (#3B82F6)
- Freelancer: Purple (#8B5CF6)
- Homemaker: Green (#10B981)
- Student: Orange (#F59E0B)
- Retired: Gray (#6B7280)

## 🔧 API Endpoints

```typescript
// GET /api/preferences - Get user preferences
// POST /api/preferences - Create/update preferences
// GET /api/preferences/widgets - Get dashboard widgets
// PUT /api/preferences/widgets - Update widget order/config
// POST /api/preferences/reset - Reset to defaults
```

## 📊 Personalization Rules

### Freelancer Profile
```typescript
{
  modules: {
    clientTracking: true,
    reports: true,
    analytics: true,
    goals: true
  },
  widgets: [
    "Balance",
    "Income Tracker",
    "Pending Payments",
    "Goal Progress",
    "Business Analytics",
    "Recent Transactions"
  ],
  categories: [
    "Business Expenses",
    "Software",
    "Marketing",
    "Equipment",
    "Utilities"
  ]
}
```

### Homemaker Profile
```typescript
{
  modules: {
    sharedLedger: true,
    bills: true,
    budgets: true
  },
  widgets: [
    "Balance",
    "Household Summary",
    "Bills Due",
    "Groceries",
    "Budget Overview",
    "Recent Transactions"
  ],
  categories: [
    "Groceries",
    "Utilities",
    "Rent",
    "Education",
    "Household Items",
    "Maintenance"
  ]
}
```

### Professional Profile
```typescript
{
  modules: {
    goals: true,
    investments: true,
    analytics: true,
    budgets: true
  },
  widgets: [
    "Balance",
    "Monthly Spending",
    "Savings Goals",
    "Investment Overview",
    "Budget Overview",
    "Insights"
  ],
  categories: [
    "Rent",
    "Subscriptions",
    "Dining",
    "Entertainment",
    "Insurance",
    "Transport"
  ]
}
```

## 🚀 Quick Start Commands

```bash
# 1. Run database migration
# Copy SQL from above and run in Supabase SQL Editor

# 2. Install any missing dependencies
pnpm install react-beautiful-dnd recharts date-fns

# 3. Create API routes
# See next section for API implementation

# 4. Build onboarding components
# Start with welcome-step.tsx and build sequentially

# 5. Test onboarding flow
pnpm dev
# Navigate to /onboarding
```

## 🧪 Testing Checklist

- [ ] Complete onboarding as each user type
- [ ] Verify correct widgets appear
- [ ] Test skip functionality
- [ ] Test back navigation
- [ ] Verify data persistence
- [ ] Test dashboard customization
- [ ] Test preference updates
- [ ] Test mobile responsiveness
- [ ] Test theme switching
- [ ] Test notification preferences

## 📱 Mobile Considerations

- Stack widgets vertically on mobile
- Simplify onboarding steps (fewer options per screen)
- Use bottom sheets for selections
- Add swipe gestures for navigation
- Optimize touch targets (min 44px)
- Test on various screen sizes

## 🔐 Security & Privacy

- Encrypt sensitive preference data
- Allow preference export/deletion
- Implement data retention policies
- Add audit log for preference changes
- Respect biometric lock settings
- Handle shared access permissions

## 🎯 Success Metrics

- Onboarding completion rate > 80%
- Average time to complete < 3 minutes
- User satisfaction score > 4.5/5
- Dashboard customization usage > 60%
- Feature discovery rate > 70%

## 📝 Next Steps

1. Run the database migration
2. Create API routes for preferences
3. Build onboarding step components
4. Implement dynamic dashboard
5. Add customization features
6. Test with real users
7. Iterate based on feedback

Would you like me to start implementing any specific component?
