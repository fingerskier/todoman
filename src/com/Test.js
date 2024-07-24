import React, { useState } from "react"
import { usePouchDB } from "../lib/pouchDBContext"


export default function MyComponent() {
  const [data, addItem] = usePouchDB()
  
  const [name, setName] = useState('')
  
  const handleAddItem = () => {
    const newItem = {
      _id: new Date().toISOString(),
      name
    }
    addItem(newItem)
    setName('')
  }
  

  return (
    <div className="App">
      <h1>PouchDB with Context Provider</h1>
      
      <ul>
        {data.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
      
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAddItem}>Add Item</button>
    </div>
  )
}