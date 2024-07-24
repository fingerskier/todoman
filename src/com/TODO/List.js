import React from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../lib/constants'
import {Link, useHREF} from '../../lib/HREFContext'


export default function List() {
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  const {link} = useHREF()
  
  
  return <div>
    <h2>TODO List</h2>
    
    <ul>
      <li>
        <Link to={VIEW.APP.ADD.path}>
          Add a ToDo
        </Link>
      </li>
      
      {todos.map((todo, index) => <li key={index}>
        <Link to={link(VIEW.APP.EDIT.path, {ID: todo.id})}>
          {todo.slug}
        </Link>
      </li>)}
    </ul>
  </div>
}
