import {useEffect, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY, VIEW} from '../../lib/constants'
import {Link, useHREF} from '../../lib/HREFContext'


export default function List() {
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  const {goto} = useHREF()
  
  const [filtered, setFiltered] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)


  const classes = item=>`
    todo ${item?.owner.toLowerCase()!=='me'? 'not-mine':''}
    ${((new Date(item?.dueDate)) < (new Date()))? 'past-due': ''}
    ${item?.completed? 'completed': ''}
  `.replace(/\s+/g, ' ').trim()
  
  
  useEffect(()=>{
    let filteredTodos = todos
    
    if (!showCompleted) {
      filteredTodos = todos.filter(todo=>!todo.completed)
    }
    
    setFiltered(filteredTodos)
  }, [showCompleted, todos])
  
  
  return <div>
    <h2>TODO List</h2>
    
    <label>
      Show Completed?
      
      <input type='checkbox' checked={showCompleted} onChange={e=>setShowCompleted(e.target.checked)} />
    </label>
    
    <ul>
      <li>
        <Link to={VIEW.APP.ADD.path}>
          Add a ToDo
        </Link>
      </li>
      
      {filtered.map((todo, index) => <li
        className={classes(todo)}
        key={index}
      >
        {todo.slug}
        ,&nbsp;
        {!(+(new Date(todo.dueDate)))? <em>open-ended</em> : todo.dueDate.toLocaleString().substr(5, 5)}
        &nbsp;
        <button onClick={e=>goto(VIEW.APP.EDIT.path, {ID: todo.id})}>edit</button>
      </li>)}
    </ul>
    
    <div>
      <div className="todo not-mine">Not Mine</div>
      <div className="todo completed">Complete</div>
      <div className="todo past-due">Past Due</div>
    </div>
  </div>
}