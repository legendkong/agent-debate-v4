import { DarkModeToggle } from 'components/dark-mode-toggle'
import { Chat } from 'components/chat'
import Image from 'next/image'

export default function Home() {
  return (
    <main className='relative container flex min-h-screen flex-col'>
      <div className=' p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur'>
        <div className='flex items-center'>
          <Image src='/SAP_logo.png' width={50} height={50} alt='SAP logo' />
          <span className='font-bold mx-5'>SAP AGENT DEBATE v4</span>
        </div>
        <DarkModeToggle />
      </div>
      <div className='flex flex-1 py-4'>
        <div className='w-full'>
          <Chat />
        </div>
      </div>
    </main>
  )
}
