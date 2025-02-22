'use client'

import { useState, useRef, useEffect } from 'react'
import VideoControls from './Controls'
import ProgressBar from './ProgressBar'
import CommentSection from './CommentSection'
import DrawingCanvas from './DrawingCanvas'

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const progressRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [comments, setComments] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 })
  const [comment, setComment] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [timelineSelection, setTimelineSelection] = useState({
    start: null,
    end: null,
  })
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [previewFrames, setPreviewFrames] = useState([])

  const getPointerPosition = (e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const handleResize = () => {
      const videoRect = video.getBoundingClientRect()
      canvas.width = videoRect.width
      canvas.height = videoRect.height
    }

    video.addEventListener('loadedmetadata', () => {
      setDuration(video.duration)
      handleResize()
    })

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    window.addEventListener('resize', handleResize)

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2

    return () => {
      video.removeEventListener('loadedmetadata', handleResize)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const togglePlayPause = async () => {
    try {
      const video = videoRef.current
      if (video.paused) {
        await video.play()
      } else {
        video.pause()
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      togglePlayPause()
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const changeSpeed = (speed) => {
    const video = videoRef.current
    video.playbackRate = speed
    setPlaybackRate(speed)
  }

  const toggleMute = () => {
    const video = videoRef.current
    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const adjustVolume = (e) => {
    const newVolume = parseFloat(e.target.value)
    const video = videoRef.current
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleProgressChange = (e) => {
    const progressBar = progressRef.current
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newTime = (x / rect.width) * duration
    videoRef.current.currentTime = newTime
  }

  const startDrawing = (e) => {
    if (!isDrawMode) return
    setIsDrawing(true)

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setIsPlaying(false)
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const rect = canvas.getBoundingClientRect()
    const point = getPointerPosition(e, rect)
    setStartPoint(point)
    setEndPoint(point)
  }

  const draw = (e) => {
    if (!isDrawing || !isDrawMode) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const rect = canvas.getBoundingClientRect()
    const currentPoint = getPointerPosition(e, rect)
    setEndPoint(currentPoint)

    ctx.beginPath()
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 3
    ctx.rect(
      startPoint.x,
      startPoint.y,
      currentPoint.x - startPoint.x,
      currentPoint.y - startPoint.y,
    )
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawMode) return
    setIsDrawing(false)
  }

  const formatTime = (timestamp) => {
    const minutes = Math.floor(timestamp / 60)
    const seconds = Math.floor(timestamp % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const handleTimelineStart = (e) => {
    if (!progressRef.current) return

    setTimelineSelection({
      start: e.time,
      end: e.time,
    })
  }

  const handleTimelineMove = (e) => {
    if (!progressRef.current || timelineSelection.start === null) return

    setTimelineSelection((prev) => ({
      ...prev,
      end: e.time,
    }))
  }

  const handleTimelineEnd = (e) => {
    if (!timelineSelection.start || !timelineSelection.end) {
      setTimelineSelection({ start: null, end: null })
      return
    }

    const start = Math.min(timelineSelection.start, timelineSelection.end)
    const end = Math.max(timelineSelection.start, timelineSelection.end)

    if (Math.abs(end - start) < 0.1) {
      setTimelineSelection({ start: null, end: null })
    } else {
      generatePreviewFrames(start, end)
    }
  }

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const toggleDrawMode = () => {
    setIsDrawMode(!isDrawMode)
    clearCanvas()
    if (isDrawMode && videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      // Get the video element and its display dimensions
      const video = videoRef.current
      const videoRect = video.getBoundingClientRect()

      // Calculate the actual display dimensions and offsets of the video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      const containerWidth = videoRect.width
      const containerHeight = videoRect.height

      let displayWidth,
        displayHeight,
        offsetX = 0,
        offsetY = 0

      const containerAspectRatio = containerWidth / containerHeight
      const videoAspectRatio = videoWidth / videoHeight

      if (containerAspectRatio > videoAspectRatio) {
        // Container is wider than video
        displayHeight = containerHeight
        displayWidth = displayHeight * videoAspectRatio
        offsetX = (containerWidth - displayWidth) / 2
      } else {
        // Container is taller than video
        displayWidth = containerWidth
        displayHeight = displayWidth / videoAspectRatio
        offsetY = (containerHeight - displayHeight) / 2
      }

      // Store the original shape coordinates and video display info
      const shapeInfo = !isDrawing && {
        shape: {
          start: startPoint,
          end: endPoint,
        },
        videoInfo: {
          originalWidth: videoWidth,
          originalHeight: videoHeight,
          displayWidth,
          displayHeight,
          offsetX,
          offsetY,
        },
      }

      const newComment = {
        text: comment,
        timeRange:
          timelineSelection.start !== null && timelineSelection.end !== null
            ? {
                start: Math.min(timelineSelection.start, timelineSelection.end),
                end: Math.max(timelineSelection.start, timelineSelection.end),
              }
            : { start: currentTime, end: currentTime },
        shapeInfo,
      }
      setComments([...comments, newComment])
      setComment('')
      setTimelineSelection({ start: null, end: null })

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setIsDrawMode(false)
    setIsDrawing(false)
    setStartPoint({ x: 0, y: 0 })
    setEndPoint({ x: 0, y: 0 })
  }

  const generatePreviewFrames = async (start, end) => {
    if (!videoRef.current) return

    const video = videoRef.current
    const wasPlaying = !video.paused
    const currentTime = video.currentTime

    try {
      if (wasPlaying) {
        await video.pause()
      }

      const frames = []
      const numFrames = 5
      const interval = (end - start) / (numFrames - 1)

      for (let i = 0; i < numFrames; i++) {
        const frameTime = start + i * interval
        video.currentTime = frameTime

        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        const canvas = document.createElement('canvas')
        canvas.width = 160
        canvas.height = 90
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        frames.push({
          time: frameTime,
          src: canvas.toDataURL('image/jpeg', 0.7),
        })
      }

      setPreviewFrames(frames)

      // Restore video state
      video.currentTime = currentTime
      if (wasPlaying) {
        await video.play()
      }
    } catch (error) {
      console.error('Error generating preview frames:', error)
    }
  }

  return (
    <div className="videoPlayer">
      <div className="videoContainer">
        <video
          ref={videoRef}
          src={src}
          className="video"
          onClick={togglePlayPause}
          playsInline
        />

        <DrawingCanvas
          canvasRef={canvasRef}
          isDrawMode={isDrawMode}
          startDrawing={startDrawing}
          draw={draw}
          endDrawing={endDrawing}
        />

        <VideoControls
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          toggleDrawMode={toggleDrawMode}
          isDrawMode={isDrawMode}
          isMuted={isMuted}
          toggleMute={toggleMute}
          volume={volume}
          adjustVolume={adjustVolume}
          playbackRate={playbackRate}
          changeSpeed={changeSpeed}
        />
      </div>

      <ProgressBar
        progressRef={progressRef}
        currentTime={currentTime}
        duration={duration}
        timelineSelection={timelineSelection}
        handleProgressChange={handleProgressChange}
        handleTimelineStart={handleTimelineStart}
        handleTimelineMove={handleTimelineMove}
        handleTimelineEnd={handleTimelineEnd}
        formatTime={formatTime}
        previewFrames={previewFrames}
        videoRef={videoRef}
      />

      <CommentSection
        comment={comment}
        setComment={setComment}
        handleSubmitComment={handleSubmitComment}
        comments={comments}
        formatTime={formatTime}
        videoSrc={src}
      />
    </div>
  )
}

export default VideoPlayer
