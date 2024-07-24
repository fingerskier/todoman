import {useEffect, useRef, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../lib/constants'

const barHeight = 33

const colorSet = [
  'yellow',
  'violet',
  'blue',
  'green',
  'orange',
  'red',
]


export default function Urgency() {
  const [todos] = useLocalStorage(KEY.TODOS, [])
  
  const popup = useRef()
  
  const [bars, setBars] = useState([])
  const [filtered, setFiltered] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)
  
  const viewHeight = 1000
  const viewWidth = 1000
  
  
  const hidePopup = todo => e => {
    popup.current.style.display = 'none'
  }
  
  
  const showPopup = todo => e => {
    popup.current.style.display = 'inline-block'
    // set the popup content
    popup.current.innerHTML = JSON.stringify(todo, null, 2)
    // set the coords of the popup to the mouse position
    popup.current.style.left = e.clientX + 'px'
    popup.current.style.top = e.clientY + 'px'
  }
  
  
  useEffect(() => {
    if (todos) {
      let these = todos.filter(todo=>todo.priority)
      
      if (!showCompleted) {
        these = these.filter(todo=>!todo.completed)
      }
      
      setFiltered(these)
    }
  }, [showCompleted, todos])
  
  
  useEffect(() => {
    if (!filtered?.length) return
    
    filtered
    .sort((a,b) =>{
      // sort by date, then by priority
      return a.dueDate.localeCompare(b.dueDate) || b.priority - a.priority
    })
    
    let newBars = filtered.map((todo,I) =>{
      const dateNum = +(new Date(todo.dueDate))
      
      let x = 0
      let y = barHeight * I
      
      return <rect
        key={I}
        x={x} 
        y={y}
        width={66*todo.priority} 
        height={barHeight}
        fill={colorSet[todo.priority]}
        onMouseOver={showPopup(todo)}
        onMouseOut={hidePopup(todo)}
      />
    })
    
    setBars(newBars)
  }, [filtered])
  
  
  return <div>
    <label>
      Show Completed?
      
      <input type='checkbox' checked={showCompleted} onChange={e=>setShowCompleted(e.target.checked)} />
    </label>
    
    <pre className='viz popup' ref={popup} />
    
    <svg
      className='viz urgency'
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
    >
      <g>
        {bars}
      </g>
    </svg>
  </div>
}