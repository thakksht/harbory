import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Logs = () => {
    const [logs, setLogs] = useState([])
    const [error, setError] = useState(null)
    const [connected, setConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const logsEndRef = useRef(null)
    const wsRef = useRef(null)
    
    const params = useParams()
    const navigate = useNavigate()
    const containerId = params.id
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081'
    // Convert HTTP URL to WebSocket URL
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    const logWsUrl = `${wsUrl}/api/containers/${containerId}/logs`

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const connectWebSocket = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return 
        }

        setConnecting(true)
        setError(null)

        try {
            console.log('Connecting to WebSocket:', logWsUrl)
            wsRef.current = new WebSocket(logWsUrl)

            wsRef.current.onopen = () => {
                console.log('WebSocket connected')
                setConnected(true)
                setConnecting(false)
                setError(null)
            }

            wsRef.current.onmessage = (event) => {
                console.log('Received log data:', event.data)
                
                try {
                    const data = JSON.parse(event.data)
                    
                    if (typeof data === 'string') {
                        setLogs(prevLogs => [...prevLogs, data])
                    } else if (Array.isArray(data)) {
                        setLogs(prevLogs => [...prevLogs, ...data])
                    } else if (data.log) {
                        setLogs(prevLogs => [...prevLogs, data.log])
                    } else if (data.message) {
                        setLogs(prevLogs => [...prevLogs, data.message])
                    }
                } catch (e) {
                    setLogs(prevLogs => [...prevLogs, event.data])
                }
            }

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error)
                setError('WebSocket connection error')
                setConnected(false)
                setConnecting(false)
            }

            // wsRef.current.onclose = (event) => {
            //     console.log('WebSocket closed:', event.code, event.reason)
            //     setConnected(false)
            //     setConnecting(false)
                
            //     if (event.code !== 1000) { 
            //         setError(`Connection closed: ${event.reason || 'Unknown reason'}`)
            //     }
            // }

        } catch (err) {
            console.error('Failed to create WebSocket:', err)
            setError(`Failed to connect: ${err.message}`)
            setConnecting(false)
        }
    }

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'User disconnected')
            wsRef.current = null
        }
        setConnected(false)
        setConnecting(false)
    }

    const reconnect = () => {
        disconnectWebSocket()
        setTimeout(connectWebSocket, 1000)
    }

    const clearLogs = () => {
        setLogs([])
    }

    useEffect(() => {
        if (containerId) {
            connectWebSocket()
        } else {
            setError('No container ID provided')
        }

        return () => {
            disconnectWebSocket()
        }
    }, [containerId])

    useEffect(() => {
        if (logs.length > 0) {
            scrollToBottom()
        }
    }, [logs])

    const getConnectionStatus = () => {
        if (connecting) return { text: 'Connecting...', color: 'text-yellow-400' }
        if (connected) return { text: 'Connected', color: 'text-green-400' }
        return { text: 'Disconnected', color: 'text-red-400' }
    }

    const status = getConnectionStatus()

    return (
        <>
            <div className='h-screen w-screen bg-gray-950 overflow-hidden m-0 flex flex-col'>
                <Navbar />
                <div className='flex-1 overflow-hidden p-4 flex flex-col'>
                    <div className='flex justify-between items-center mb-4'>
                        <div className='flex items-center gap-4'>
                            <button 
                                onClick={() => navigate('/containers')}
                                className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm'
                            >
                                ← Back
                            </button>
                            <h1 className='text-white text-2xl font-bold'>
                                Container Logs
                            </h1>
                        </div>
                        
                        <div className='flex items-center gap-2'>
                            {/* Connection Status */}
                            <div className={`px-3 py-1 rounded text-sm font-medium ${status.color}`}>
                                ● {status.text}
                            </div>
                            
                            {/* Reconnect */}
                            <button 
                                onClick={reconnect}
                                disabled={connecting}
                                className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded text-sm'
                            >
                                {connecting ? 'Connecting...' : 'Reconnect'}
                            </button>
                            
                            {/* Disconnect */}
                            <button 
                                onClick={disconnectWebSocket}
                                disabled={!connected}
                                className='bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm'
                            >
                                Disconnect
                            </button>
                            
                            {/* Clear */}
                            <button 
                                onClick={clearLogs}
                                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm'
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                        {/* Error Display */}
                    {error && (
                        <div className='bg-red-900 border border-red-700 rounded-lg p-4 text-red-200 mb-4'>
                            <h3 className='font-bold mb-2'>Error</h3>
                            <p className='whitespace-pre-wrap'>{error}</p>
                            <button 
                                onClick={reconnect}
                                className='mt-2 bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded text-sm'
                            >
                                Retry Connection
                            </button>
                        </div>
                    )}

                    {/* Logs Container */}
                    <div className='flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex flex-col'>
                        <div className='bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center'>
                            <span className='text-gray-300 text-sm font-medium'>Live Logs Stream</span>
                            <span className='text-gray-400 text-xs'>
                                {logs.length} lines
                                {connected && <span className='text-green-400 ml-2'>● Streaming</span>}
                            </span>
                        </div>
                        
                        <div className='flex-1 overflow-auto p-4 font-mono text-sm bg-black'>
                            {logs.length === 0 ? (
                                <div className='text-gray-400'>
                                    {connecting ? 'Connecting to log stream...' : 
                                     connected ? 'Waiting for logs...' : 
                                     'Not connected to log stream'}
                                </div>
                            ) : (
                                <div>
                                    {logs.map((log, index) => (
                                        <div 
                                            key={index} 
                                            className='text-gray-200 hover:bg-gray-800 px-2 py-1 rounded mb-1'
                                        >
                                            <span className='text-gray-500 mr-3 select-none'>
                                                {String(index + 1).padStart(4, ' ')}
                                            </span>
                                            <span className='whitespace-pre-wrap break-words'>{log}</span>
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Logs