import React from 'react'
import {useHREF} from '../../lib/HREFContext'
import {newItem} from '../../lib/helpers'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../lib/constants'


export default function Edit() {
  const {ID} = useHREF()
  
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  
  
  const update = event=>{
    event.preventDefault()
    const form = event.target
    const slug = form.slug.value
    
    let item = newItem(slug)
    item = {
      ...item,
      details: form.details.value,
      owner: form.owner.value,
      due: form.due.value,
      priority: form.priority.value,
      completed: form.completed.checked
    }
    
    setTodos([...todos, item])
    
    form.reset()
    form.slug.focus()
    
    return false
  }
  
  return <div>
    Edit #{ID}
    
    <br />
    
    <form onSubmit={update}>
      <label>
        Slug:
        <input type="text" name="slug" />
      </label>
      <br />
      <label>
        Details:
        <textarea name="details" />
      </label>
      <br />
      <label>
        Owner:
        <input type="text" name="owner" />
      </label>
      <br />
      <label>
        Due:
        <input type="date" name="due" />
      </label>
      <br />
      <label>
        Priority:
        <input type="number" name="priority" />
      </label>
      <br />
      <label>
        Completed:
        <input type="checkbox" name="completed" />
      </label>
      <br />
      <button type="submit">Update</button>
    </form>
  </div>
}