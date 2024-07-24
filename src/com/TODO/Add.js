import React from 'react'
import { newItem } from '../../lib/helpers'
import useLocalStorage from '../../hook/useLocalStorage'
import { KEY } from '../../lib/constants'


export default function Add() {
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  
  const add = (event) => {
    event.preventDefault()
    
    const form = event.target
    const slug = form.slug.value
    const item = newItem(slug)
    
    setTodos([...todos, item])
    
    form.reset()
    form.slug.focus()
    
    return false
  }
  
  
  return <div>
    <form onSubmit={add}>
      <label>
        Slug:
        <input autoFocus={true} type="text" name="slug" />
      </label>
      <br />
      <button type="submit">Add</button>
    </form>
  </div>
}
