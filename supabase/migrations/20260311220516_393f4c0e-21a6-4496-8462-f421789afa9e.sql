
-- Create role enum
CREATE TYPE public.app_role AS ENUM (
  'admin', 'tecnico_dpro', 'tecnico_dex', 'tecnico_dneg', 'tecnico_dec', 'conselho'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Function to get user role as text
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

-- Trigger: auto-assign role on profile creation based on cargo
CREATE OR REPLACE FUNCTION public.assign_role_on_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (
    NEW.user_id,
    CASE NEW.cargo
      WHEN 'Administrador' THEN 'admin'
      WHEN 'Técnico DPRO' THEN 'tecnico_dpro'
      WHEN 'Técnico DEX' THEN 'tecnico_dex'
      WHEN 'Técnico DNEG' THEN 'tecnico_dneg'
      WHEN 'Técnico DEC' THEN 'tecnico_dec'
      WHEN 'Conselho de Adm.' THEN 'conselho'
      ELSE 'tecnico_dpro'
    END::app_role
  ) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_role_on_profile();

-- Seed roles for existing profiles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id,
  CASE p.cargo
    WHEN 'Administrador' THEN 'admin'
    WHEN 'Técnico DPRO' THEN 'tecnico_dpro'
    WHEN 'Técnico DEX' THEN 'tecnico_dex'
    WHEN 'Técnico DNEG' THEN 'tecnico_dneg'
    WHEN 'Técnico DEC' THEN 'tecnico_dec'
    WHEN 'Conselho de Adm.' THEN 'conselho'
    ELSE 'tecnico_dpro'
  END::app_role
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;
