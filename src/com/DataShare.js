import {useEffect, useState} from 'react'
import useLocalStorage from '../hook/useLocalStorage'
import {KEY} from '../lib/constants'
import usePeer from '../hook/usePeer'


export default function DataShare() {
  const [todos, setTodos] = useLocalStorage(KEY.TODOS, [])
  
  const [initialPeerId, setInitialPeerId] = useState('')
  const [remotePeerId, setRemotePeerId] = useState('')
  const [peerIdSet, setPeerIdSet] = useState(false)
  
  const { 
    connections,
    connectToPeer,
    payload,
    peerId,
    sendMessage,
    setPeerId
  } = usePeer()
  
  const [show, setShow] = useState(false)
  
  
  const handleSetPeerId = () => {
    setPeerId(initialPeerId)
  }
  
  const handleConnect = () => {
    connectToPeer(remotePeerId)
  }
  
  
  const handleSendMessage = () => {
    const payload = {todos}
    
    console.log('sending', payload)
    sendMessage(payload)
  }
  
  
  const mergeById = (originalArray, newArray) => {
    const mergedArray = [...originalArray]
    
    newArray.forEach(newItem => {
      const index = mergedArray.findIndex(item => item.id === newItem.id)
      
      if (index > -1) {
        mergedArray[index] = { ...mergedArray[index], ...newItem }
      } else {
        mergedArray.push(newItem)
      }
    })
    return mergedArray
  }
  
  
  useEffect(() => {
    console.log('received data', payload)
    
    if (payload) {
      // merge payload into todos
      const newTodos = mergeById(todos, payload.todos)
      setTodos(newTodos)
    }
  }, [payload])
  
  
  useEffect(() => {
    if (peerId) {
      setPeerIdSet(true)
    }
  }, [peerId])
  
  
  
  return <div>
    {show? <div>
      {!peerIdSet ? (
        <div>
          <label htmlFor="my-peer-id">Set an ID for yourself</label>
          <input
            autoFocus
            type="text"
            value={initialPeerId}
            onChange={(e) => setInitialPeerId(e.target.value)}
            placeholder="Enter your Peer ID"
          />
          <br />
          <button onClick={handleSetPeerId}>Set Peer ID</button>
        </div>
      ) : (
        <div>
          <h1>My PeerJS ID: {peerId}</h1>
          
          <label htmlFor="remote-peer-id">Who do you want to connect to?</label>
          <input
            autoFocus
            id="remote-peer-id"
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Remote Peer ID"
          />
          <br />
          <button onClick={handleConnect}>Connect</button>
          {connections?.length && <>
            <br />
            <button onClick={handleSendMessage}>Send Message</button>
          </>}

          <h3>Connections:</h3>
          <ul>
            {connections.map((conn, index) => (
              <li key={index}>{conn.peer}</li>
            ))}
          </ul>
          
          <pre>
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      )}
    </div> : <>
      <button onClick={() => setShow(true)}>Share Data</button>
    </> }
  </div>
}