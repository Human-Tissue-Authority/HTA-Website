import { useEffect, useState } from 'react'	

// checks if document/window exists	
export const useHasMounted = () => {	
  const [hasMounted, setHasMounted] = useState(false)	

  useEffect(() => {	
    setHasMounted(true)	
  }, [])	

  return hasMounted	
}
