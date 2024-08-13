import {useEffect, useRef} from 'react'


export default function Popup({
  item,
  mouse,
  show,
}) {
  const ref = useRef()
  
  
  useEffect(()=>{
    if (ref.current) {
      ref.current.style.left = mouse.left
      ref.current.style.top = mouse.top
    }
  }, [mouse])
  
  
  if (show) return <div>
    <pre className='viz popup' ref={ref}>
      {JSON.stringify(item, null, 2)}
    </pre>
  </div>
}