
import { useEffect, useState } from 'react';
export function useDebouncedValue<TValue>(value:TValue,delay:number):TValue {
  const [debounced,setDebounced]=useState(value);
  useEffect(()=>{const timer=setTimeout(()=>setDebounced(value),delay);return()=>clearTimeout(timer);},[value,delay]);
  return debounced;
}
