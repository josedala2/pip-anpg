

## Problem

The Index page currently filters visible panels based on the user's role via `useUserRole()`. If a user's role isn't correctly assigned in the database (common with the current setup), they may see an empty or limited dashboard. The original platform showed all 6 panels to everyone.

The role-based filtering on panels in `Index.tsx` (lines 31-34) reduces visible tabs:
```js
const panels = allPanels.filter(p => allowedPanels.includes(p));
```

If `allowedPanels` is empty (no role found), **no panels appear at all**.

## Plan

### 1. Remove panel filtering from Index.tsx
- Show all 6 panels (`Overview`, `Blocos & Concessões`, `Produção`, `Exploração & Sísmica`, `Risk & Performance`, `Strategic Forecast`) to every authenticated user
- Replace the filtered `panels` with the full `allPanels` array
- Keep `useUserRole` only for the header UI (role label, admin links)

### 2. Keep role-based restrictions only where appropriate
- Admin links in header (user management) still gated by `role === "admin"`
- Data management link still gated by role
- Report type filtering in `ReportsPage` can remain role-based if desired
- Login page remains as-is (access gate only)

### 3. Files to modify
- **`src/pages/Index.tsx`**: Remove the `panels` filtering logic, use `allPanels` directly throughout the component

This restores the full dashboard experience for all logged-in users while keeping the login as a simple access control layer.

