import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom';

const ContainerDetails = () => {
  const [select,setSelected] = useState('start');
  const [containerInfo, setContainerInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams();
  const containerId = params.id;
  const apiurl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const containerDetails = async (containerId) =>{
    try{
      setLoading(true);
      const response = await fetch(`${apiurl}/api/containers`, {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch container details');
      }
      const data = await response.json();
      const container = data.find(c => c.Id === containerId);
      if (container) {
        setContainerInfo(container);
      } else {
        console.error('Container not found');
      }
    }catch(err){
      setError(err.message);
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    containerDetails(containerId);
  }, [containerId]);

  const formatCreated = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const formatPorts = (ports) => {
    if (!ports || ports.length === 0) return '-'
    return ports
      .filter(port => port.PublicPort)
      .map(port => `${port.PublicPort}:${port.PrivatePort}`)
      .join(', ') || '-'
  }

  const stopContainer = async (id) => {
    try {
      const response = await fetch(`${apiurl}/api/containers/${id}/stop`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Failed to stop container')
      }
      containerDetails(id)
      setSelected('stop')
    } catch (err) {
      setError(err.message)
    }
  }

  const startContainer = async (id) => {
    try{
      const response = await fetch(`${apiurl}/api/containers/${id}/start`,{
        method: 'POST'
      })
      if (!response.ok){
        throw new Error('Failed to start container')
      }
      containerDetails(id)
      setSelected('start')
    }catch(err){
      setError(err.message)
    }
  }
  const deleteContainer = async (id) => {
    try{
      const response = await fetch(`${apiurl}/api/containers/${id}/delete`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok){
        throw new Error('Failed to delete container')
      }
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className='bg-gray-950 h-screen w-screen'>
      <Navbar />
      {loading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='text-white text-lg'>Loading containers...</div>
            </div>
          ) : error ? (
            <div className='bg-red-900 border border-red-700 rounded-lg p-4 text-red-200'>
              <h3 className='font-bold mb-2'>Error</h3>
              <p>{error}</p>
              <button 
                onClick={containerDetails(containerId)}
                className='mt-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm'
              >
                Retry
              </button>
            </div>
           ) : (<div className='flex flex-col items-start justify-start pl-20 pt-6'>
        <div className='text-3xl text-white font-bold'>
          Container Details
        </div>
        <div className='text-md text-gray-400 mt-2'>
          Manage and monitor your container's performance and settings.
        </div>
        <div className='text-xl text-white font-bold mt-6'>
          Actions
        </div>
        <div className='pt-4 flex items-center gap-3'>
          <button className={`h-9 w-18 rounded-lg ${select === 'start' ? 'bg-blue-100 text-black':'bg-gray-500 text-white hover:bg-gray-600 hover:text-white'}  transition-colors duration-300 mr-2`} onClick={() => startContainer(containerId)}>
            Start
          </button>
          <button className={`h-9 w-18 rounded-lg ${select === 'stop' ? 'bg-blue-100 text-black':'bg-gray-500 text-white hover:bg-gray-600 hover:text-white'}  transition-colors duration-300 mr-2`} onClick={() => stopContainer(containerId)}>
            Stop
          </button>
        </div>
        <div className='pt-4 flex items-center gap-3'>
          <button className={'h-9 w-18 rounded-lg bg-gray-500 text-white hover:bg-gray-600 hover:text-white  transition-colors duration-300 mr-2'} onClick={()=>navigate(`/logs/${containerId}`)}>
            Logs
          </button>
          <button className={'h-9 w-18 rounded-lg bg-gray-500 text-white hover:bg-gray-600 hover:text-white}  transition-colors duration-300 mr-2'} onClick={()=>(
            deleteContainer(containerId).then(() => navigate('/containers'))
          )}>
            Delete
          </button>
        </div>
        <div className='text-xl text-white font-bold mt-6'>
          Container Information
        </div>
        <div className='flex space-x-12 mt-4 w-full pr-25'>
          <div className='flex flex-col border-t-1 border-white h-18 w-45 items-start justify-center'>
            <div className='text-gray-400 text-sm'>
              Name
            </div>
            <div className='text-white text-sm'>
              {containerInfo.Names}
            </div>
          </div>
          <div className='flex flex-col border-t-1 border-white h-18 w-full items-start justify-center'>
            <div className='text-gray-400 text-sm'>
              Status
            </div>
            <div className='text-white text-sm'>
              {containerInfo.State}
            </div>
          </div>
        </div>
        <div className='flex space-x-12 mt-4 w-full pr-25'>
          <div className='flex flex-col border-t-1 border-white h-18 w-45 items-start justify-center'>
            <div className='text-gray-400 text-sm'>
              Image
            </div>
            <div className='text-white text-sm'>
              {containerInfo.Image}
            </div>
          </div>
          <div className='flex flex-col border-t-1 border-white h-18 w-full items-start justify-center'>
            <div className='text-gray-400 text-sm'>
              Created
            </div>
            <div className='text-white text-sm'>
              {containerInfo.Status}
            </div>
          </div>
        </div>
        <div className='flex space-x-12 mt-4 w-full pr-25'>
          <div className='flex flex-col border-t-1 border-white h-18 w-37 items-start justify-center'>
            <div className='text-gray-400 text-sm'>
              Ports
            </div>
            <div className='text-white text-sm'>
              {formatPorts(containerInfo.Ports)}
            </div>
          </div>
        </div>
      </div>)} 
    </div>
  )
}

export default ContainerDetails
