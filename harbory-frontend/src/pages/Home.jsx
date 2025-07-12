import { AppWindow, Cuboid, Image, Inbox, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

const Home = () => {
  const [systemInfo, setSystemInfo] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiurl = import.meta.env.VITE_API_URL

  const fetchSystemInfo = async () => {
    try{
      setLoading(true)
      const response = await fetch(`${apiurl}/api/system/info`,{
        method: 'GET'
      })
      if (!response.ok){
        throw new Error('Failed to fetch system information')
      }
      const data = await response.json()
      setSystemInfo(data)
      setError(null)
    }catch(err){
      setError(err.message)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchSystemInfo()
  },[])

  const calculateUpTime = (startTime) => {
    


    const now = new Date()
    const start = new Date(startTime)
    const diff = now - start

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${days} days ${hours} hours ${minutes} minutes`
  }

  return (

    <div className='h-screen w-screen bg-gray-950 overflow-hidden m-0 flex'>
      <div className='w-64 bg-gray-950 border-r-1 border-white p-4'>
        <nav className='space-y-2'>
          <div className='flex items-center space-x-3 bg-gray-700 p-3 rounded-lg text-white cursor-pointer'>
            {/* <div className='w-5 h-5 bg-blue-500 rounded'></div> */}
            <AppWindow className='w-5 h-5' />
            <span>Dashboard</span>
          </div>
          <div className='flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer' onClick={() => window.location.href = '/containers'}>
            {/* <div className='w-5 h-5 border-2 border-gray-400 rounded'></div> */}
            <Cuboid className='w-5 h-5' />
            <span>Containers</span>
          </div>
          <div className='flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer'>
            {/* <div className='w-5 h-5 border-2 border-gray-400 rounded'></div> */}
            <Image className='w-5 h-5' />
            <span>Images</span>
          </div>
          <div className='flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer'>
            {/* <div className='w-5 h-5 border-2 border-gray-400 rounded'></div> */}
            <Inbox className='w-5 h-5' />
            <span>Volumes</span>
          </div>
          <div className='flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 cursor-pointer'>
            {/* <div className='w-5 h-5 border-2 border-gray-400 rounded'></div> */}
            <Wifi className='w-5 h-5' />
            <span>Networks</span>
          </div>
        </nav>
      </div>
      
      <div className='flex-1 p-8'>
        <h1 className='text-4xl font-bold text-white mb-8'>Dashboard</h1>
        
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold text-white mb-6'>System Overview</h2>
          
          {loading ?(
            <div className='flex justify-center items-center h-64'>
              <div className='text-white text-lg'>Loading system info...</div>
            </div>
          ):
            (<div className='grid grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Docker Version</span>
                <span className='text-white'>{systemInfo.ServerVersion}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Images</span>
                <span className='text-white'>{systemInfo.Images}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Volumes</span>
                <span className='text-white'>{systemInfo.Plugins?.Volume.length}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Operating System</span>
                <span className='text-white'>{systemInfo.OperatingSystem}</span>
              </div>
            </div>
            
            <div className='space-y-4'>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Containers</span>
                <span className='text-white'>{systemInfo.Containers}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Networks</span>
                <span className='text-white'>{systemInfo.Plugins?.Network.length}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Uptime</span>
                <span className='text-white'>{calculateUpTime(systemInfo.SystemTime)}</span>
              </div>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <span className='text-gray-300'>Architecture</span>
                <span className='text-white'>{systemInfo.Architecture}</span>
              </div>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  )
}

export default Home
