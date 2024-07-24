import React from 'react'
import { getItem } from '../hook/useLocalStorage'
import { KEY } from '../lib/constants'


export default function DownloadJSON({
  filename = 'data.json',
}) {
  const downloadJSON = () => {
    const events = getItem(KEY.EVENTS)
    const people = getItem(KEY.PEOPLE)
    const prayers = getItem(KEY.PRAYERS)
    const topics = getItem(KEY.TOPICS)
    
    const data = {
      events,
      people,
      prayers,
      topics,
    }
    
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url) // Free up memory
  }
  
  
  return (
    <button onClick={downloadJSON}>Download JSON</button>
  )
}