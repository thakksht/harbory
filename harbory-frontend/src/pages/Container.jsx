import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'


const Container = () => {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const apiurl = import.meta.env.VITE_API_URL

  const fetchContainers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiurl}/api/containers`)
      if (!response.ok) {
        throw new Error('Failed to fetch containers')
      }
      const data = await response.json()
      setContainers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
  }, [])

  const formatPorts = (ports) => {
    if (!ports || ports.length === 0) return '-'
    return ports
      .filter(port => port.PublicPort)
      .map(port => `${port.PublicPort}:${port.PrivatePort}`)
      .join(', ') || '-'
  }

  const formatCreated = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getContainerName = (names) => {
    return names[0]?.replace('/', '') || 'Unknown'
  }

  const getStatusColor = (state) => {
    switch (state.toLowerCase()) {
      case 'running':
        return 'text-green-400'
      case 'exited':
      case 'stopped':
        return 'text-red-400'
      case 'paused':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (state) => {
    switch (state.toLowerCase()) {
      case 'running':
        return '●'
      case 'exited':
      case 'stopped':
        return '●'
      case 'paused':
        return '⏸'
      default:
        return '●'
    }
  }

  const stopContainer = async (id) => {
    try {
      const response = await fetch(`${apiurl}/api/containers/${id}/stop`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Failed to stop container')
      }
      fetchContainers()
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
      fetchContainers()
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
      fetchContainers()
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <>
      <div className='h-screen w-screen bg-gray-950 overflow-hidden m-0 flex flex-col'>
        <Navbar/>
        <div className='flex-1 overflow-auto p-4'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-white text-3xl font-bold'>
              Container List
            </h1>
            <div className='flex gap-2'>
              <button 
                onClick={fetchContainers}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm'
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <div className='text-white text-lg'>Loading containers...</div>
            </div>
          ) : error ? (
            <div className='bg-red-900 border border-red-700 rounded-lg p-4 text-red-200'>
              <h3 className='font-bold mb-2'>Error</h3>
              <p>{error}</p>
              <button 
                onClick={fetchContainers}
                className='mt-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded text-sm'
              >
                Retry
              </button>
            </div>
          ) : (
            <div className='bg-gray-800 rounded-lg overflow-hidden shadow-lg'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                  <thead className='text-xs text-gray-300 uppercase bg-gray-700'>
                    <tr>
                      <th className='px-6 py-3'>Name</th>
                      <th className='px-6 py-3'>Image</th>
                      <th className='px-6 py-3'>Status</th>
                      <th className='px-6 py-3'>State</th>
                      <th className='px-6 py-3'>Ports</th>
                      <th className='px-6 py-3'>Created</th>
                      <th className='px-6 py-3'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {containers.map((container) => (
                      <tr key={container.Id} className='bg-gray-800 border-b border-gray-700 hover:bg-gray-750'>
                        <td className='px-6 py-4'>
                          <div className='flex items-center'>
                            <span className={`mr-2 ${getStatusColor(container.State)}`}>
                              {getStatusIcon(container.State)}
                            </span>
                            <div>
                              <div className='font-medium text-white'>{getContainerName(container.Names)}</div>
                              <div className='text-xs text-gray-400'>{container.Id.substring(0, 12)}</div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-gray-300'>{container.Image}</td>
                        <td className='px-6 py-4'>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            container.State.toLowerCase() === 'running' ? 'bg-green-100 text-green-800' :
                            container.State.toLowerCase() === 'exited' || container.State.toLowerCase() === 'stopped' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {container.State}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-gray-300'>{container.Status}</td>
                        <td className='px-6 py-4 text-gray-300'>{formatPorts(container.Ports)}</td>
                        <td className='px-6 py-4 text-gray-300'>
                          {formatCreated(container.Created)}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='text-md text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors' onClick={
                            () => 
                              navigate(`/containers/${container.Id}`)
                          }>
                            Inspect
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !error && containers.length === 0 && (
            <div className='bg-gray-800 rounded-lg p-8 text-center'>
              <div className='text-gray-400 text-lg mb-2'>No containers found</div>
              <div className='text-gray-500 text-sm'>No Docker containers are currently available</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Container