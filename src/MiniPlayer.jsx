import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
const MiniPlayer = ({ videoSrc, startTime, endTime, shapeInfo }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !shapeInfo || !shapeInfo.shape) return

    const drawShape = () => {
      const { shape, videoInfo } = shapeInfo
      const {
        originalWidth,
        originalHeight,
        displayWidth: originalDisplayWidth,
        displayHeight: originalDisplayHeight,
        offsetX: originalOffsetX,
        offsetY: originalOffsetY,
      } = videoInfo

      const containerWidth = video.offsetWidth
      const containerHeight = video.offsetHeight

      let displayWidth,
        displayHeight,
        offsetX = 0,
        offsetY = 0
      const containerAspectRatio = containerWidth / containerHeight
      const videoAspectRatio = originalWidth / originalHeight

      if (containerAspectRatio > videoAspectRatio) {
        displayHeight = containerHeight
        displayWidth = displayHeight * videoAspectRatio
        offsetX = (containerWidth - displayWidth) / 2
      } else {
        displayWidth = containerWidth
        displayHeight = displayWidth / videoAspectRatio
        offsetY = (containerHeight - displayHeight) / 2
      }

      const scaleX = displayWidth / originalDisplayWidth
      const scaleY = displayHeight / originalDisplayHeight

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = 'orange'
      ctx.lineWidth = 3

      const originalRelativeStart = {
        x: shape.start.x - originalOffsetX,
        y: shape.start.y - originalOffsetY,
      }
      const originalRelativeEnd = {
        x: shape.end.x - originalOffsetX,
        y: shape.end.y - originalOffsetY,
      }

      const scaledShape = {
        start: {
          x: originalRelativeStart.x * scaleX + offsetX,
          y: originalRelativeStart.y * scaleY + offsetY,
        },
        end: {
          x: originalRelativeEnd.x * scaleX + offsetX,
          y: originalRelativeEnd.y * scaleY + offsetY,
        },
      }

      ctx.rect(
        scaledShape.start.x,
        scaledShape.start.y,
        scaledShape.end.x - scaledShape.start.x,
        scaledShape.end.y - scaledShape.start.y,
      )
      ctx.stroke()
    }

    const handleResize = () => {
      const { shape, videoInfo } = shapeInfo
      const {
        originalWidth,
        originalHeight,
        displayWidth: originalDisplayWidth,
        displayHeight: originalDisplayHeight,
        offsetX: originalOffsetX,
        offsetY: originalOffsetY,
      } = videoInfo

      const containerWidth = video.offsetWidth
      const containerHeight = video.offsetHeight

      let displayWidth,
        displayHeight,
        offsetX = 0,
        offsetY = 0
      const containerAspectRatio = containerWidth / containerHeight
      const videoAspectRatio = originalWidth / originalHeight

      if (containerAspectRatio > videoAspectRatio) {
        displayHeight = containerHeight
        displayWidth = displayHeight * videoAspectRatio
        offsetX = (containerWidth - displayWidth) / 2
      } else {
        displayWidth = containerWidth
        displayHeight = displayWidth / videoAspectRatio
        offsetY = (containerHeight - displayHeight) / 2
      }

      // Set canvas dimensions
      canvas.width = containerWidth
      canvas.height = containerHeight

      // Calculate scale factors
      const scaleX = displayWidth / originalDisplayWidth
      const scaleY = displayHeight / originalDisplayHeight

      // Draw shape
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = 'orange'
      ctx.lineWidth = 3

      const originalRelativeStart = {
        x: shape.start.x - originalOffsetX,
        y: shape.start.y - originalOffsetY,
      }
      const originalRelativeEnd = {
        x: shape.end.x - originalOffsetX,
        y: shape.end.y - originalOffsetY,
      }

      const scaledShape = {
        start: {
          x: originalRelativeStart.x * scaleX + offsetX,
          y: originalRelativeStart.y * scaleY + offsetY,
        },
        end: {
          x: originalRelativeEnd.x * scaleX + offsetX,
          y: originalRelativeEnd.y * scaleY + offsetY,
        },
      }

      ctx.rect(
        scaledShape.start.x,
        scaledShape.start.y,
        scaledShape.end.x - scaledShape.start.x,
        scaledShape.end.y - scaledShape.start.y,
      )
      ctx.stroke()
    }

    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.pause()
        setIsPlaying(false)
        video.currentTime = startTime
      }
      drawShape()
    }

    video.addEventListener('loadedmetadata', () => {
      handleResize()
      drawShape()
    })
    video.addEventListener('timeupdate', handleTimeUpdate)
    window.addEventListener('resize', () => {
      handleResize()
      drawShape()
    })

    video.currentTime = startTime

    return () => {
      video.removeEventListener('loadedmetadata', handleResize)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      window.removeEventListener('resize', handleResize)
    }
  }, [startTime, endTime, shapeInfo])

  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (video.paused) {
        video.currentTime = startTime
        await video.play()
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
    }
  }

  return (
    <div className="miniPlayer">
      <div className="miniPlayerContainer">
        <video
          ref={videoRef}
          src={videoSrc}
          className="miniVideo"
          playsInline
        />
        <canvas ref={canvasRef} className="miniCanvas" />
        <button onClick={togglePlayPause} className="miniPlayButton">
          {isPlaying ? <Pause className="icon" /> : <Play className="icon" />}
        </button>
      </div>
    </div>
  )
}

export default MiniPlayer
