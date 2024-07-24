import React from 'react'
import {Link} from '../lib/HREFContext'
import {VIEW} from '../lib/constants'
import DownloadButton from './DownloadButton'
import {useHREF} from '../lib/HREFContext'


export default function Footer() {
  const {goto} = useHREF()
  
  
  return <footer>
    <div className='menu'>
      <Link to={VIEW.APP.path}>Home</Link>
      <Link to={VIEW.APP.ADD.path}>Add</Link>
      <Link to={VIEW.APP.LIST.path}>List</Link>
      <Link to={VIEW.APP.VIZ.path}>VIZ</Link>
    </div>
    
    <div>
      <DownloadButton />
      
      <button onClick={e=>goto(VIEW.APP.DATA.path)}>Data</button>
    </div>
  </footer>
}