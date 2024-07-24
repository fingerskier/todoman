import {v4 as uuid} from 'uuid'
import {defaultItem} from './constants'


const filterPattern = str=>{
  const escapedFilter = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const patternString = escapedFilter.split('').join('.*')
  return new RegExp(patternString, 'i')
}


function isDigit(char) {
  return !isNaN(parseInt(char));
}


function newItem(slug='new to-do') {
  return {
    ...defaultItem,
    id: uuid(),
    slug,
  }
}


export {
  filterPattern,
  isDigit,
  newItem,
}