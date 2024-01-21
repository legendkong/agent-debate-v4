'use client'

import { Button } from './ui/button'

const RefreshBtn: React.FC = () => {
  const refreshPage = (): void => {
    window.location.reload()
  }
  return (
    <Button className='bg-sky-950 text-slate-50' onClick={refreshPage}>
      + New chat
    </Button>
  )
}

export default RefreshBtn
