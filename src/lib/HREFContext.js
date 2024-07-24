import React, { createContext, useContext, useEffect, useState } from 'react';

const currentHash = ()=>window.location.hash.substring(1)
const HREFContext = createContext();
const parseQuery = queryString=>{
  const params = {}
  
  queryString = queryString || window.location.search
  
  const queryParts = (queryString[0] === '?' ? queryString.slice(1) : queryString)
    .split('&');
  
  queryParts.forEach(part => {
    const [key, value] = part.split('=').map(decodeURIComponent)
    if (params[key]) {
      params[key] = [].concat(params[key], value)
    } else {
      params[key] = value
    }
  })
  
  return params
}

const setHashString = name=> window.location.hash = name


const setQueryString = (params, override = false)=>{
  const searchParams = new URLSearchParams(override ? '' : window.location.search)
  
  Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
          searchParams.delete(key)
      } else {
          searchParams.set(key, value)
      }
  })
  
  const newQueryString = searchParams.toString()
  window.history.replaceState({}, '', `${window.location.pathname}?${newQueryString}${window.location.hash}`)
}

const canonicalHREF = (hash,query)=>`${query? '?' + new URLSearchParams(query).toString(): ''}#${hash}`


export const useHREF = () => useContext(HREFContext)


export const HREFProvider = ({
  children,
  verbose=false,
}) => {
  const [query, setQuery] = useState({})
  const [state, setState] = useState(currentHash)
  
  
  const goto = (name, params, override = false) => {
    const hrefName = name?.join? name.join('/'): name
    
    setHashString(hrefName)
    
    if (params) setQueryString(params, override)
  }
  
  
  const link = (name, params) => {
    const hrefName = name?.join? name.join('/'): name
    
    return canonicalHREF(hrefName, params)
  }


  const push = (params, override = false)=>{
    setQueryString(params,override)
    setQuery(parseQuery())
  }
  
  
  useEffect(() => {
    const handleHashChange = () => {
      setState(currentHash)
      setQuery(parseQuery(window.location.search))
    }
    
    window.addEventListener('hashchange', handleHashChange)
    
    handleHashChange()
    
    return () => {
        window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])
  
  
  const context = {
    ...query,
    goto,
    link,
    push,
    query,
    state,
  }
  
  return (
    <HREFContext.Provider value={context}>
      {children}
    </HREFContext.Provider>
  )
}


export const Scene = ({ parent, name, children, element }) => {
  const {state} = useHREF()
  
  const fullName = parent? `${parent}/${name}`: name
  
  const shouldRender = state.startsWith(fullName)
  
  
  const render = (stuff,parm={})=>React.Children.map(stuff, child => {
    if ( !React.isValidElement(child)) return child
    
    if (child.type === Scene) parm[name] = name
    
    return React.cloneElement(child, { 
      ...parm,
      parent: fullName,
    })
  })
  
  const result = []
  
  if (shouldRender) {
    if (children) result.push(render(children))
    
    if (element) result.push(render(element, {name: name}))
  }
  
  return result
}


export function Link({
  children,
  className,
  to='/',
  highlight,
  highlightAtState=true,
  plain=false,
  query,
}) {
  const {link, state} = useHREF()
  
  const [classes, setClasses] = useState('')
  
  
  useEffect(() => {
    if (plain) return setClasses('')
    
    let result = []
    if (highlight) result.push('highlight')
    
    if (highlightAtState && state?.length && (link(to).endsWith(state))) result.push('highlight')
    
    setClasses(result.join(' '))
  }, [highlight, highlightAtState, plain, state])
  
  
  return <a
    href={link(to, query)}
    className={classes + className? ' ' + className: ''}
  >
    {children}
  </a>
}
