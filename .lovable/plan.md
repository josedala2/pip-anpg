

## Plan: Smooth Transition Between Hero and Form Panel

### Problem
The left image panel ends abruptly where the right form panel begins, creating a hard visual cut.

### Solution
1. **Extend the background image** to cover the full viewport (both panels) instead of just the left 60%.
2. **Apply a gradient overlay on the right panel** that transitions from the image's dark tones to the form's background color.
3. **Make the right panel semi-transparent** with a backdrop blur so the image subtly bleeds through.

### Changes in `src/pages/LoginPage.tsx`

- Move the satellite `<img>` and dark overlay out of the left panel and into the root container as a full-screen background layer.
- Change the right panel from `bg-background` to a gradient like `bg-gradient-to-r from-transparent via-background/80 to-background` with `backdrop-blur`.
- Add an edge gradient on the left panel's right side (`bg-gradient-to-r from-transparent to-background/60`) for a seamless blend.

Alternatively (simpler approach keeping current structure):
- Keep the image in the left panel but add an **extra gradient overlay on the right edge** of the left panel: `bg-gradient-to-r from-transparent to-background` so it fades into the form's background color.
- Give the right panel a subtle matching gradient: `bg-gradient-to-r from-background/80 to-background`.

### Files Modified
- `src/pages/LoginPage.tsx` — adjust gradient overlays and panel backgrounds (minimal changes).

