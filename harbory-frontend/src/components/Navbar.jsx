import React from 'react'
import {Settings, User} from 'lucide-react'
const Navbar = () => {
  return (
    <div className='w-screen h-15 bg-gray-950 border-b border-white top-0 z-0 flex items-center justify-between px-4 text-white'>
      <div className='font-bold text-2xl cursor-pointer hover:text-gray-400 transition-colors tracking-wide' onClick={() => window.location.href = '/'}>
        Harbory
      </div>
      <div className='flex items-center space-x-6'>
        <div className='cursor-pointer hover:text-gray-400 transition-colors font-semibold' onClick={() => window.location.href = '/containers'}>
          Containers
        </div>
        <div className='cursor-pointer hover:text-gray-400 transition-colors font-semibold' onClick={() => window.location.href = '/images'}>
          Images
        </div>
        <div className='cursor-pointer hover:text-gray-400 transition-colors font-semibold' onClick={() => window.location.href = '/volumes'}>
          Volumes
        </div>
        <div className='cursor-pointer hover:text-gray-400 transition-colors font-semibold' onClick={() => window.location.href = '/networks'}>
          Networks
        </div>
        <div className='bg-gray-400 rounded-lg'>
        <Settings className='cursor-pointer hover:rotate-180 transition-transform p-1 w-7 h-7'/>
        </div>
        <div className='bg-gray-400 rounded-lg hover:bg-gray-800 transition-colors hover:text-gray-400'>
            <User className='cursor-pointer w-7 h-7 p-1' />
        </div>
      </div>
    </div>
  )
}

export default Navbar
