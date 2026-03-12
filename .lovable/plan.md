

## Plan: Show only operator's blocks on operator detail map

### Change

In `src/components/dashboard/OperatorsPanel.tsx`, line 376: replace `blocks={oilBlocks}` with `blocks={operatorBlocks}`, filtering to only the blocks operated by the current operator.

The `operatorBlocks` variable likely already exists (used elsewhere in the detail view) or will be derived as:
```ts
const operatorBlocks = oilBlocks.filter(b => b.operator === operator.name);
```

This single-line change ensures the map renders only the selected operator's concessions, removing visual clutter from unrelated blocks.

