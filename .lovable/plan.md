

## Plan: Remove Signup & Add Test Accounts on Login Page

### Changes

1. **Remove signup route and page reference** from `src/App.tsx` -- delete the `/signup` route and `SignupPage` import.

2. **Update `src/pages/LoginPage.tsx`**:
   - Remove the "Criar conta" link at the bottom.
   - Add a "Contas de teste" section below the form with 2-3 clickable test account cards (e.g. Admin, Analista, Gestor) showing email/password. Clicking a card auto-fills the form fields for quick login.

3. **Create test accounts in the database** via a migration that seeds test users using `auth.users` -- actually, since we cannot insert directly into `auth.users` via migration, we will instead enable auto-confirm for email signups, then create the accounts programmatically. Alternatively, the simplest approach: display hardcoded demo credentials on the login page and create matching accounts via the auth system.

4. **Delete `src/pages/SignupPage.tsx`** (no longer needed).

### Test Accounts to Display

| Role | Email | Password |
|------|-------|----------|
| Administrador | admin@anpg.co.ao | admin123 |
| Analista | analista@anpg.co.ao | analista123 |
| Gestor | gestor@anpg.co.ao | gestor123 |

### UI for Test Accounts

Below the login form, a bordered section titled "Contas de Teste" with clickable rows. Each row shows the role, email, and a "Usar" button that auto-fills email + password fields.

### Steps

1. Enable auto-confirm email signups (so test accounts work without email verification)
2. Remove `/signup` route from `App.tsx` and delete `SignupPage.tsx`
3. Update `LoginPage.tsx`: remove signup link, add test accounts section with auto-fill functionality
4. Create an edge function or seed script to ensure the 3 test accounts exist (signup them programmatically on first load, or document manual creation)

