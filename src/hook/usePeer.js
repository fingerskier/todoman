// usePeer.js
import { useState, useEffect, useRef } from 'react'
import Peer from 'peerjs'

const usePeer = () => {
  const [payload, setPayload] = useState()
  const [peer, setPeer] = useState(null)
  const [connections, setConnections] = useState([])
  const connectionsRef = useRef([])
  
  
  const setPeerId = initialPeerId => {
    if (!initialPeerId) return
    
    const peerInstance = new Peer(initialPeerId)
    
    
    peerInstance.on('open', (id) => {
      console.log('My peer ID is: ' + id)
      setPeer(peerInstance)
    })
    
    
    peerInstance.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log('Received', data)
      })
      
      connectionsRef.current.push(conn)
      setConnections([...connectionsRef.current])
    })
    
    
    peerInstance.on('error', (error) => {
      console.error('Peer error:', error)
    })
    
    
    return () => {
      peerInstance.destroy()
    }
  }
  
  
  const connectToPeer = (remotePeerId) => {
    if (!peer) {
      console.error('Peer instance is not initialized')
      return
    }
    
    console.log('attempting connection to', remotePeerId, '...')
    
    const conn = peer.connect(remotePeerId)
    
    conn.on('open', () => {
      console.log('Connection to', remotePeerId, 'opened')
      conn.send('Connected to ' + peer.id)
    })
    
    conn.on('data', (data) => {
      console.log('Received from ' + remotePeerId + ':', data)
      setPayload(data)
    })
    
    conn.on('error', (err) => {
      console.error('Connection error:', err)
    })
    
    conn.on('close', () => {
      console.log('Connection to', remotePeerId, 'closed')
    })
    
    connectionsRef.current.push(conn)
    setConnections([...connectionsRef.current])
  }
  
  
  const sendMessage = (message) => {
    console.log(connectionsRef.current)
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(message)
      } else if (conn.error) {
        console.error('Connection error:', conn.error)
      } else {
        console.error('Connection is not open')
      }
    })
  }
  
  
  return {
    connections,
    connectToPeer,
    payload,
    peerId: peer ? peer.id : null,
    sendMessage,
    setPeerId,
  }
}


export default usePeer