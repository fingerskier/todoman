import React from 'react'
import {Scene} from '../lib/HREFContext'
import {STATE} from '../lib/constants'
import DataShare from './DataShare'
import TODO from './TODO'


export default function Home() {
  return <main>
    <Scene name={STATE.APP}>
      <Scene name={STATE.ADD} element={<TODO.Add />} />
      
      <Scene name={STATE.EDIT} element={<TODO.Edit />} />
      
      <Scene name={STATE.LIST} element={<TODO.List />} />
      
      <Scene name={STATE.VIZ} element={<TODO.Viz />} />
      
      <Scene name={STATE.DATA} element={<DataShare />} />
    </Scene>
  </main>
}