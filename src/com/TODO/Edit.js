import {useEffect, useState} from 'react'
import {useHREF} from '../../lib/HREFContext'
import {newItem} from '../../lib/helpers'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../lib/constants'


export default function Edit() {
  const {goto, ID} = useHREF()
  
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  
  const [priorityLabel, setPriorityLabel] = useState('priority')
  const [thisn, setThisn] = useState({})


  const handleOwnerChange = event => {
    const {value} = event.target
    
    if (value.toLowerCase() !== 'me') setThisn({
      ...thisn,
      priority: 0,
    })
  }
  
  
  const update = event=>{
    event.preventDefault()
    
    const form = event.target
    
    let item = {
      ...thisn,
      slug: form.slug.value,
      details: form.details.value,
      owner: form.owner.value,
      dueDate: form.dueDate.value,
      priority: form.priority.value,
      completed: form.completed.checked
    }
    
    const thisIndex = todos.findIndex(todo=>todo.id===ID)
    todos[thisIndex] = item
    
    setTodos([...todos])
    
    goto(VIEW.APP.LIST.path)
    
    return false
  }
  
  
  const updatePriorityLabel = (priority)=>{
    console.log(priority)
    priority = +priority
    
    if (priority) {
      let label = 'priority'
      
      if (priority === 1) label = 'eventual'
      else if (priority === 2) label = 'low'
      else if (priority === 3) label = 'regular'
      else if (priority === 4) label = 'urgent'
      else if (priority === 5) label = 'emergency'
      else label = 'unimportant'
      
      setPriorityLabel(label)
    }
  }
  
  
  useEffect(()=>{
    if (todos && ID) {
      const dat = todos.filter(todo=>todo.id===ID)
      setThisn(dat[0])
    }
  }, [ID, todos])
  
  
  useEffect(() => {
    if (thisn?.priority) updatePriorityLabel(thisn.priority)
  }, [thisn])
  
  
  return <div>
    Edit #{ID}
    
    <br />
    
    <pre>Raw: {JSON.stringify(thisn, null, 2)}</pre>
    
    <form onSubmit={update}>
      <label htmlFor='edit-slug'> Slug: </label>
      <input
        autoFocus={true}
        id="edit-slug"
        type="text"
        name="slug" 
        defaultValue={thisn?.slug}
      />
      <br />
      <label htmlFor='edit-details'> Details: </label>
      <textarea id="edit-details" name="details" 
        defaultValue={thisn?.details}
      />
      <br />
      <label htmlFor='edit-owner'> Owner: </label>
      <input
        defaultValue={thisn?.owner}
        id="edit-owner"
        name="owner"
        onBlur={handleOwnerChange}
        type="text"
      />
      <br />
      <label htmlFor='edit-due'> Due-Date: </label>
      <input id="edit-due" type="date" name="dueDate" 
        defaultValue={thisn?.dueDate}
      />
      <br />
      <label htmlFor='edit-priority'> Priority: </label>
      <input
        defaultValue={thisn?.priority}
        id="edit-priority"
        max="5"
        min="1"
        name="priority"
        onChange={e=>updatePriorityLabel(e.target.value)}
        type="range"
      />
      {priorityLabel}
      <br />
      <label htmlFor='edit-completed'> Completed: </label>
      <input id="edit-completed" type="checkbox" name="completed" 
        defaultChecked={thisn?.completed}
      />
      <br />
      <button type="submit">Update</button>
    </form>
  </div>
}