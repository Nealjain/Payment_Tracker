-- Create user_preferences table for onboarding and customization

CREATE TABLE IF NOT EXISTS public.user_preferences (
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
  FOR SELECT USING (
    auth.uid() = user_id OR
    user_id IN (SELECT id FROM public.users WHERE username = current_setting('app.current_username', true))
  );

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    user_id IN (SELECT id FROM public.users WHERE username = current_setting('app.current_username', true))
  );

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (
    auth.uid() = user_id OR
    user_id IN (SELECT id FROM public.users WHERE username = current_setting('app.current_username', true))
  );

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (
    auth.uid() = user_id OR
    user_id IN (SELECT id FROM public.users WHERE username = current_setting('app.current_username', true))
  );

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_type ON public.user_preferences(user_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_completed ON public.user_preferences(onboarding_completed);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to get user dashboard config
CREATE OR REPLACE FUNCTION public.get_user_dashboard_config(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config jsonb;
BEGIN
  SELECT jsonb_build_object(
    'userType', user_type,
    'dashboardLayout', dashboard_layout,
    'themePreference', theme_preference,
    'widgets', dashboard_widgets,
    'modulesEnabled', modules_enabled
  )
  INTO config
  FROM public.user_preferences
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(config, '{}'::jsonb);
END;
$$;

-- Add function to check if user completed onboarding
CREATE OR REPLACE FUNCTION public.has_completed_onboarding(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed boolean;
BEGIN
  SELECT onboarding_completed
  INTO completed
  FROM public.user_preferences
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(completed, false);
END;
$$;
