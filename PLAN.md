Ultimate ToDo App:
* 3 rows, each with multiple columns (configurable.) ~ Kanban-ish
* ToDo items are cards in these columns.
* Rows are preset:
  1. Priority
  2. Scheduled
  3. Delegated

Priority columns are configurable
- name
- ordinal (left->right)
- Scheduled columns are buckets sorted by quarter (2025-Q4, 2026-Q1, etc.)
- Delegated columns are owner buckets

- Clicking a todo item opens a modal editor for it.
- Enable drag&drop of items between rows/columns.
- Dragging between rows opens the editor for that item
  - when dragging into "Scheduled" flash the due-date input
  - when dragging into "Delegated" flash the owner input

- Use Dexie.js cloud for storage?
- Deployed to GH Pages, https://fingerskier.github.io/todoman, via GH Action.

Schema:
todo {
  id
  name
  due_date    # this is what differentiates as "scheduled"
  owner       # this is what differentiates as "delegated"
  details
  active      # inactive items are hidden
}
