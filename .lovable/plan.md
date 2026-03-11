

## Plan: Role-Based Access Control (RBAC)

### Roles & Permissions Matrix

| Panel/Feature | Administrador | Técnico DPRO | Técnico DEX | Técnico DNEG | Técnico DEC | Conselho Adm. |
|---|---|---|---|---|---|---|
| Overview | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Blocos & Concessões | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Produção | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Exploração & Sísmica | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Risk & Performance | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Strategic Forecast | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Relatórios (export) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*Administrador and Conselho see everything. Each Técnico sees Overview + Blocos + their departmental panels.*

### Database Changes

1. **Create `user_roles` table** with `app_role` enum matching the 6 roles
2. **Create `has_role()` security definer function**
3. **Seed roles** for existing test accounts via a trigger on `profiles` that maps `cargo` to role, or a direct seed migration

```sql
CREATE TYPE public.app_role AS ENUM (
  'admin', 'tecnico_dpro', 'tecnico_dex', 'tecnico_dneg', 'tecnico_dec', 'conselho'
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

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
SELECT p.user_id, (CASE p.cargo ... END)::app_role FROM public.profiles p
ON CONFLICT DO NOTHING;
```

### Frontend Changes

1. **Create `src/hooks/useUserRole.ts`** — fetches the user's role from `user_roles` table, exposes `role` and a `hasAccess(panelName)` helper with the permissions matrix above.

2. **Update `src/components/AuthProvider.tsx`** — expose `role` in auth context (fetched after login).

3. **Update `src/pages/Index.tsx`**:
   - Filter `panels` array based on role permissions — hide tabs the user cannot access.
   - Show a subtle badge with the user's role in the header dropdown.

4. **Update `src/pages/ReportsPage.tsx`** — filter available report types based on role (e.g. Técnico DEX can only generate exploration reports).

### Files to Create/Modify
- **Migration**: 1 SQL migration (user_roles table + trigger + seed)
- **Create**: `src/hooks/useUserRole.ts`
- **Modify**: `src/components/AuthProvider.tsx`, `src/pages/Index.tsx`, `src/pages/ReportsPage.tsx`

