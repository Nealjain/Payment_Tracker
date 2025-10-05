-- Create dues table for tracking money owed to/from others
CREATE TABLE IF NOT EXISTS public.dues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  phone_number character varying,
  amount numeric NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['owed_to_me'::character varying, 'i_owe'::character varying]::text[])),
  payment_type character varying,
  remark text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_settled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dues_pkey PRIMARY KEY (id),
  CONSTRAINT dues_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_dues_user_id ON public.dues(user_id);
CREATE INDEX IF NOT EXISTS idx_dues_is_settled ON public.dues(is_settled);
