import React, {useEffect, useMemo, useState} from 'react'
import './App.css'

const TODOS_STORAGE_KEY = 'todoman.todos.v1'
const COLUMNS_STORAGE_KEY = 'todoman.columns.v1'

const DEFAULT_COLUMNS = {
  priority: [
    {id: 'priority-now', name: 'Now', ordinal: 1},
    {id: 'priority-next', name: 'Next', ordinal: 2},
    {id: 'priority-later', name: 'Later', ordinal: 3},
  ],
  scheduled: [
    {id: 'scheduled-2025-q4', name: '2025-Q4', ordinal: 1},
    {id: 'scheduled-2026-q1', name: '2026-Q1', ordinal: 2},
    {id: 'scheduled-2026-q2', name: '2026-Q2', ordinal: 3},
    {id: 'scheduled-unscheduled', name: 'Unscheduled', ordinal: 4},
  ],
  delegated: [
    {id: 'delegated-alex', name: 'Alex', ordinal: 1},
    {id: 'delegated-morgan', name: 'Morgan', ordinal: 2},
    {id: 'delegated-taylor', name: 'Taylor', ordinal: 3},
    {id: 'delegated-unassigned', name: 'Unassigned', ordinal: 4},
  ],
}

const ROW_DEFINITIONS = {
  priority: {
    title: 'Priority',
    description: 'Configurable columns sorted left-to-right by ordinal.',
    addPlaceholder: 'Example: Blocked',
  },
  scheduled: {
    title: 'Scheduled',
    description: 'Configurable quarter buckets derived from due date.',
    addPlaceholder: 'Example: 2026-Q3',
  },
  delegated: {
    title: 'Delegated',
    description: 'Configurable owner buckets derived from owner.',
    addPlaceholder: 'Example: Jordan',
  },
}

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

function loadFromStorage(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return fallback

    const parsed = JSON.parse(stored)
    return parsed || fallback
  } catch (error) {
    return fallback
  }
}

function loadTodos() {
  const parsed = loadFromStorage(TODOS_STORAGE_KEY, INITIAL_TODOS)
  return Array.isArray(parsed) ? parsed : INITIAL_TODOS
}

function loadColumns() {
  const parsed = loadFromStorage(COLUMNS_STORAGE_KEY, DEFAULT_COLUMNS)
  return {
    priority: normalizeColumns(parsed.priority, DEFAULT_COLUMNS.priority),
    scheduled: normalizeColumns(parsed.scheduled, DEFAULT_COLUMNS.scheduled),
    delegated: normalizeColumns(parsed.delegated, DEFAULT_COLUMNS.delegated),
  }
}

function normalizeColumns(columns, fallback) {
  const source = Array.isArray(columns) && columns.length ? columns : fallback
  return source.map((column, index) => ({
    id: column.id || createColumnId(column.name || `Column ${index + 1}`),
    name: column.name || `Column ${index + 1}`,
    ordinal: Number.isFinite(Number(column.ordinal)) ? Number(column.ordinal) : index + 1,
  }))
}

function createColumnId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'column'}-${Date.now()}`
}

function createTodoId() {
  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getQuarterBucket(dueDate) {
  if (!dueDate) return 'Unscheduled'

  const [year, month] = dueDate.split('-').map(Number)
  if (!year || !month) return 'Unscheduled'

  return `${year}-Q${Math.ceil(month / 3)}`
}

function bucketToDueDate(bucket) {
  const match = bucket.match(/^(\d{4})-Q([1-4])$/)
  if (!match) return ''

  const startMonth = (Number(match[2]) - 1) * 3 + 1
  return `${match[1]}-${String(startMonth).padStart(2, '0')}-01`
}

function sortColumns(columns) {
  return [...columns].sort((a, b) => a.ordinal - b.ordinal || a.name.localeCompare(b.name))
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

function BoardRow({title, description, columns, todos, onCardClick, onConfigure, onDragStart, onDropTodo}) {
  return (
    <section className="board-row" aria-label={`${title} board row`}>
      <div className="board-row__label">
        <h2>{title}</h2>
        <p>{description}</p>
        <button type="button" className="button button--small button--secondary" onClick={onConfigure}>
          Configure columns
        </button>
      </div>
      <div className="board-row__columns">
        {columns.map((column) => (
          <BoardColumn
            key={`${column.row}-${column.id}`}
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

function TodoEditor({todo, emphasis, priorityColumns, onClose, onDelete, onSave}) {
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
          <h2>{todo.id ? 'Edit todo' : 'Add todo'}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close editor">×</button>
        </div>

        <label>
          Name
          <input required value={draft.name} onChange={(event) => update('name', event.target.value)} />
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
            {priorityColumns.map((column) => <option key={column.id}>{column.name}</option>)}
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
          {todo.id && <button type="button" className="button button--danger" onClick={() => onDelete(todo.id)}>Delete todo</button>}
          <span className="modal__action-spacer" />
          <button type="button" className="button button--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button">Save todo</button>
        </div>
      </form>
    </div>
  )
}

function ColumnConfigurator({rowKey, columns, onAdd, onClose, onDelete, onUpdate}) {
  const definition = ROW_DEFINITIONS[rowKey]
  const [newColumnName, setNewColumnName] = useState('')

  function addColumn(event) {
    event.preventDefault()
    onAdd(rowKey, newColumnName)
    setNewColumnName('')
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h2>Configure {definition.title} columns</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close column configurator">×</button>
        </div>

        <div className="column-config-list">
          {columns.map((column) => (
            <div className="column-config-row" key={column.id}>
              <label>
                Column name
                <input value={column.name} onChange={(event) => onUpdate(rowKey, column.id, 'name', event.target.value)} />
              </label>
              <label>
                Ordinal
                <input type="number" value={column.ordinal} onChange={(event) => onUpdate(rowKey, column.id, 'ordinal', event.target.value)} />
              </label>
              <button type="button" className="button button--danger" onClick={() => onDelete(rowKey, column.id)}>Delete</button>
            </div>
          ))}
        </div>

        <form className="column-add-form" onSubmit={addColumn}>
          <label>
            Add column
            <input value={newColumnName} placeholder={definition.addPlaceholder} onChange={(event) => setNewColumnName(event.target.value)} />
          </label>
          <button type="submit" className="button">Add column</button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [columnsByRow, setColumnsByRow] = useState(loadColumns)
  const [editorState, setEditorState] = useState(null)
  const [configuringRow, setConfiguringRow] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos))
    } catch (error) {
      // Ignore write failures (e.g. storage disabled or over quota).
    }
  }, [todos])

  useEffect(() => {
    try {
      window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnsByRow))
    } catch (error) {
      // Ignore write failures (e.g. storage disabled or over quota).
    }
  }, [columnsByRow])

  const activeTodos = todos.filter((todo) => todo.active)
  const priorityColumns = useMemo(() => sortColumns(columnsByRow.priority), [columnsByRow.priority])

  const rows = [
    {
      rowKey: 'priority',
      ...ROW_DEFINITIONS.priority,
      columns: priorityColumns.map((column) => ({...column, row: 'priority', value: column.name, label: column.name, filter: (todo) => todo.priority === column.name})),
    },
    {
      rowKey: 'scheduled',
      ...ROW_DEFINITIONS.scheduled,
      columns: sortColumns(columnsByRow.scheduled).map((column) => ({...column, row: 'scheduled', value: column.name, label: column.name, filter: (todo) => getQuarterBucket(todo.due_date) === column.name})),
    },
    {
      rowKey: 'delegated',
      ...ROW_DEFINITIONS.delegated,
      columns: sortColumns(columnsByRow.delegated).map((column) => ({...column, row: 'delegated', value: column.name, label: column.name, filter: (todo) => (todo.owner || 'Unassigned') === column.name})),
    },
  ]

  function openEditor(todoId, {emphasis = null, overrides = null} = {}) {
    setEditorState({todoId, emphasis, overrides})
  }

  function addTodo() {
    setEditorState({
      todoId: null,
      emphasis: null,
      overrides: {
        id: '',
        name: '',
        due_date: '',
        owner: '',
        details: '',
        active: true,
        priority: priorityColumns[0]?.name || '',
      },
    })
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

    if (column.row === 'scheduled') {
      const target = todos.find((todo) => todo.id === todoId)
      const alreadyInBucket = target && getQuarterBucket(target.due_date) === column.value
      openEditor(todoId, {
        emphasis: 'due_date',
        overrides: alreadyInBucket ? null : {due_date: bucketToDueDate(column.value)},
      })
      return
    }

    // Delegated columns: pre-fill the target owner so saving commits the move.
    openEditor(todoId, {
      emphasis: 'owner',
      overrides: {owner: column.value === 'Unassigned' ? '' : column.value},
    })
  }

  function saveTodo(updatedTodo) {
    setTodos((current) => {
      if (!updatedTodo.id) return [...current, {...updatedTodo, id: createTodoId()}]
      return current.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo)
    })
    setEditorState(null)
  }

  function deleteTodo(todoId) {
    setTodos((current) => current.filter((todo) => todo.id !== todoId))
    setEditorState(null)
  }

  function addColumn(rowKey, columnName) {
    const name = columnName.trim()
    if (!name) return

    setColumnsByRow((current) => ({
      ...current,
      [rowKey]: [
        ...current[rowKey],
        {id: createColumnId(name), name, ordinal: Math.max(0, ...current[rowKey].map((column) => Number(column.ordinal) || 0)) + 1},
      ],
    }))
  }

  function updateColumn(rowKey, columnId, field, value) {
    setColumnsByRow((current) => ({
      ...current,
      [rowKey]: current[rowKey].map((column) => column.id === columnId ? {...column, [field]: field === 'ordinal' ? Number(value) : value} : column),
    }))
  }

  function deleteColumn(rowKey, columnId) {
    setColumnsByRow((current) => ({
      ...current,
      [rowKey]: current[rowKey].filter((column) => column.id !== columnId),
    }))
  }

  const editingBase = editorState?.todoId ? todos.find((todo) => todo.id === editorState.todoId) : editorState?.overrides
  const editingTodo = editingBase && editorState.overrides ? {...editingBase, ...editorState.overrides} : editingBase

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Todoman</p>
        <h1>Three-lane todo planning board</h1>
        <p>Plan active work by priority, due-date quarter, and owner delegation.</p>
        <button type="button" className="button hero__action" onClick={addTodo}>Add todo</button>
      </header>

      <div className="board">
        {rows.map((row) => (
          <BoardRow
            key={row.title}
            {...row}
            todos={activeTodos}
            onCardClick={openEditor}
            onConfigure={() => setConfiguringRow(row.rowKey)}
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
          onDelete={deleteTodo}
          onSave={saveTodo}
        />
      )}

      {configuringRow && (
        <ColumnConfigurator
          rowKey={configuringRow}
          columns={sortColumns(columnsByRow[configuringRow])}
          onAdd={addColumn}
          onClose={() => setConfiguringRow(null)}
          onDelete={deleteColumn}
          onUpdate={updateColumn}
        />
      )}
    </main>
  )
}

export default App
