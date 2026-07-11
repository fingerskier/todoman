import React, {useMemo, useState} from 'react'
import './App.css'

const PRIORITY_COLUMNS = [
  {name: 'Now', ordinal: 1},
  {name: 'Next', ordinal: 2},
  {name: 'Later', ordinal: 3},
]

const INITIAL_TODOS = [
  {
    id: 'todo-1',
    name: 'Finalize launch checklist',
    due_date: '2026-01-15',
    owner: 'Alex',
    details: 'Confirm blockers, owners, and the remaining release tasks.',
    active: true,
    priority: 'Now',
  },
  {
    id: 'todo-2',
    name: 'Draft customer update',
    due_date: '2025-11-20',
    owner: 'Morgan',
    details: 'Summarize roadmap changes and open feedback questions.',
    active: true,
    priority: 'Next',
  },
  {
    id: 'todo-3',
    name: 'Archive completed milestones',
    due_date: '2026-04-08',
    owner: 'Taylor',
    details: 'Move finished milestone notes into the project archive.',
    active: true,
    priority: 'Later',
  },
  {
    id: 'todo-4',
    name: 'Schedule vendor review',
    due_date: '2026-02-03',
    owner: 'Alex',
    details: 'Book time to review renewal terms and support expectations.',
    active: true,
    priority: 'Next',
  },
]

function getQuarterBucket(dueDate) {
  if (!dueDate) return 'Unscheduled'

  const [year, month] = dueDate.split('-').map(Number)
  if (!year || !month) return 'Unscheduled'

  return `${year}-Q${Math.ceil(month / 3)}`
}

function quarterSortValue(bucket) {
  const match = bucket.match(/^(\d{4})-Q([1-4])$/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1]) * 10 + Number(match[2])
}

function uniqueSorted(values, sorter = (a, b) => a.localeCompare(b)) {
  return Array.from(new Set(values)).sort(sorter)
}

function TodoCard({todo, onClick, onDragStart}) {
  return (
    <button
      className="todo-card"
      draggable
      onClick={() => onClick(todo.id)}
      onDragStart={(event) => onDragStart(event, todo.id)}
      type="button"
    >
      <span className="todo-card__title">{todo.name}</span>
      <span className="todo-card__meta">Due {todo.due_date || 'unscheduled'}</span>
      <span className="todo-card__meta">Owner {todo.owner || 'unassigned'}</span>
    </button>
  )
}

function BoardColumn({column, todos, onCardClick, onDragStart, onDropTodo}) {
  return (
    <section
      className="board-column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDropTodo(event, column)}
    >
      <header className="board-column__header">
        <h3>{column.label}</h3>
        <span>{todos.length}</span>
      </header>
      <div className="board-column__cards">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onClick={onCardClick}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </section>
  )
}

function BoardRow({title, description, columns, todos, onCardClick, onDragStart, onDropTodo}) {
  return (
    <section className="board-row" aria-label={`${title} board row`}>
      <div className="board-row__label">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="board-row__columns">
        {columns.map((column) => (
          <BoardColumn
            key={`${column.row}-${column.value}`}
            column={column}
            todos={todos.filter(column.filter)}
            onCardClick={onCardClick}
            onDragStart={onDragStart}
            onDropTodo={onDropTodo}
          />
        ))}
      </div>
    </section>
  )
}

function TodoEditor({todo, emphasis, priorityColumns, onClose, onSave}) {
  const [draft, setDraft] = useState(todo)

  function update(field, value) {
    setDraft((current) => ({...current, [field]: value}))
  }

  function submit(event) {
    event.preventDefault()
    onSave(draft)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal" onSubmit={submit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2>Edit todo</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close editor">×</button>
        </div>

        <label>
          Name
          <input value={draft.name} onChange={(event) => update('name', event.target.value)} />
        </label>

        <label className={emphasis === 'due_date' ? 'field-emphasis' : ''}>
          Due date
          <input type="date" value={draft.due_date} onChange={(event) => update('due_date', event.target.value)} autoFocus={emphasis === 'due_date'} />
        </label>

        <label className={emphasis === 'owner' ? 'field-emphasis' : ''}>
          Owner
          <input value={draft.owner} onChange={(event) => update('owner', event.target.value)} autoFocus={emphasis === 'owner'} />
        </label>

        <label>
          Priority
          <select value={draft.priority} onChange={(event) => update('priority', event.target.value)}>
            {priorityColumns.map((column) => <option key={column.name}>{column.name}</option>)}
          </select>
        </label>

        <label>
          Details
          <textarea value={draft.details} onChange={(event) => update('details', event.target.value)} rows="4" />
        </label>

        <label className="checkbox-label">
          <input type="checkbox" checked={draft.active} onChange={(event) => update('active', event.target.checked)} />
          Active
        </label>

        <div className="modal__actions">
          <button type="button" className="button button--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button">Save todo</button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [todos, setTodos] = useState(INITIAL_TODOS)
  const [editorState, setEditorState] = useState(null)

  const activeTodos = todos.filter((todo) => todo.active)
  const priorityColumns = useMemo(() => [...PRIORITY_COLUMNS].sort((a, b) => a.ordinal - b.ordinal), [])
  const scheduledBuckets = uniqueSorted(activeTodos.map((todo) => getQuarterBucket(todo.due_date)), (a, b) => quarterSortValue(a) - quarterSortValue(b))
  const ownerBuckets = uniqueSorted(activeTodos.map((todo) => todo.owner || 'Unassigned'))

  const rows = [
    {
      title: 'Priority',
      description: 'Configurable columns sorted left-to-right by ordinal.',
      columns: priorityColumns.map((column) => ({row: 'priority', value: column.name, label: column.name, filter: (todo) => todo.priority === column.name})),
    },
    {
      title: 'Scheduled',
      description: 'Quarter buckets derived from due date.',
      columns: scheduledBuckets.map((bucket) => ({row: 'scheduled', value: bucket, label: bucket, filter: (todo) => getQuarterBucket(todo.due_date) === bucket})),
    },
    {
      title: 'Delegated',
      description: 'Owner buckets derived from owner.',
      columns: ownerBuckets.map((owner) => ({row: 'delegated', value: owner, label: owner, filter: (todo) => (todo.owner || 'Unassigned') === owner})),
    },
  ]

  function openEditor(todoId, emphasis = null) {
    setEditorState({todoId, emphasis})
  }

  function handleDragStart(event, todoId) {
    event.dataTransfer.setData('text/todoman-id', todoId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(event, column) {
    event.preventDefault()
    const todoId = event.dataTransfer.getData('text/todoman-id')
    if (!todoId) return

    if (column.row === 'priority') {
      setTodos((current) => current.map((todo) => todo.id === todoId ? {...todo, priority: column.value} : todo))
      return
    }

    openEditor(todoId, column.row === 'scheduled' ? 'due_date' : 'owner')
  }

  function saveTodo(updatedTodo) {
    setTodos((current) => current.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo))
    setEditorState(null)
  }

  const editingTodo = editorState ? todos.find((todo) => todo.id === editorState.todoId) : null

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Todoman</p>
        <h1>Three-lane todo planning board</h1>
        <p>Plan active work by priority, due-date quarter, and owner delegation.</p>
      </header>

      <div className="board">
        {rows.map((row) => (
          <BoardRow
            key={row.title}
            {...row}
            todos={activeTodos}
            onCardClick={openEditor}
            onDragStart={handleDragStart}
            onDropTodo={handleDrop}
          />
        ))}
      </div>

      {editingTodo && (
        <TodoEditor
          todo={editingTodo}
          emphasis={editorState.emphasis}
          priorityColumns={priorityColumns}
          onClose={() => setEditorState(null)}
          onSave={saveTodo}
        />
      )}
    </main>
  )
}

export default App
