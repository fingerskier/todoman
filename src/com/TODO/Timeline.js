import {useEffect, useRef, useState} from 'react'
import useLocalStorage from '../../hook/useLocalStorage'
import {KEY} from '../../lib/constants'

const barHeight = 25

const colorSet = [
  'yellow',
  'violet',
  'blue',
  'green',
  'orange',
  'red',
]


export default function Timeline() {
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
      let these = todos.filter(todo=>todo.dueDate?.length)
      
      if (!showCompleted) {
        these = these.filter(todo=>!todo.completed)
      }
      
      setFiltered(these)
    }
  }, [showCompleted, todos])
  
  
  useEffect(() => {
    if (!filtered?.length) return
    
    let max = Number.MIN_VALUE;
    let min = Number.MAX_VALUE;
    
    filtered.forEach(todo => {
      const dateNum = +(new Date(todo.dueDate))
      if (dateNum) {1
        max = Math.max(max, dateNum);
        min = Math.min(min, dateNum);
      }
    });
    
    let range = max - min
    
    let colorI = 0
    
    let newBars = filtered.map((todo,I) =>{
      const dateNum = +(new Date(todo.dueDate))
      
      let x = barHeight * I
      let y = dateNum? (dateNum - min) / range * viewHeight: 0
      
      return <rect
        key={I}
        x={x} 
        y={y}
        width={100*todo.priority} 
        height={barHeight}
        fill={colorSet[todo.priority]}
        stroke='black'
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
      className='viz timeline'
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
    >
      <text
        x="10" y="-500"
        writing-mode="vertical-rl" transform="rotate(-180, 20, 20)"
        fontSize={32}
      >&lt;--- Newer / Older ---&gt;</text>
      
      <g>
        {bars}
      </g>
    </svg>
  </div>
}