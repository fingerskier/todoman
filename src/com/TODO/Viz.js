import {useEffect, useState} from 'react'
import Timeline from './Timeline'
import Urgency from './Urgency'

const views = [
  'Urgency',
  'Timeline',
]


export default function Viz() {
  const [view, setView] = useState(views[0])
  
  
  return <div className='viz container'>
    {views.map((thing, index) => <button
      className={`${view===thing? 'active':''}`}
      key={index}
      onClick={e=>setView(thing)}
    >
      {thing}
    </button>)}
    
    {view==='Urgency' && <Urgency />}
    {view==='Timeline' && <Timeline />}
  </div>
}
