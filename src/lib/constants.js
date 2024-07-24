const KEY = {
  PEOPLE: 'people',
  TOPICS: 'topics',
  TODO: 'TODO',
}


const STATE = {
  ADD: 'ADD',
  APP: 'APP',
  DATA: 'DATA',
  DASH: 'DASH',
  EDIT: 'EDIT',
  EVENTS: 'EVENTS',
  LIST: 'LIST',
  PEOPLE: 'PEOPLE',
  TODO: 'TODO',
  TOPICS: 'TOPICS',
}


const VIEWS = {
  APP: {
    ADD: STATE.ADD,
    DASH: STATE.DASH,
    DATA: STATE.DATA,
    EDIT: STATE.EDIT,
    LIST: STATE.LIST,
  }
}


const addPathFunction = (obj, path = []) => {
  return new Proxy(obj, {
    get(target, property) {
      if (property === 'path') {
        return path
      }
      const value = target[property]
      if (typeof value === 'object' && value !== null) {
        return addPathFunction(value, path.concat(property))
      }
      return {
        value,
        path: path.concat(property)
      }
    }
  })
}

const VIEW = addPathFunction(VIEWS)


const defaultItem = {
  slug: "todo item",
  details: "todo details",
  owner: "owner",
  dueDate: "2024-08-23",
  priority: 1,
  completed: false,
}

const defaultToDos = [defaultItem, defaultItem, defaultItem]


export {
  KEY,
  STATE,
  VIEW,
  defaultItem,
  defaultToDos,
}