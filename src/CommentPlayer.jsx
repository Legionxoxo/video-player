import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

const CommentPlayer = ({ src, comments }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const handleResize = () => {
      const videoRect = video.getBoundingClientRect()
      canvas.width = videoRect.width
      canvas.height = videoRect.height
    }

    video.addEventListener('loadedmetadata', handleResize)
    window.addEventListener('resize', handleResize)

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      drawActiveComments(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleResize)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      window.removeEventListener('resize', handleResize)
    }
  }, [comments])

  const drawActiveComments = (time) => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    comments.forEach((comment) => {
      if (time >= comment.timeRange.start && time <= comment.timeRange.end) {
        // Draw shape if it exists
        if (comment.shape) {
          ctx.beginPath()
          ctx.strokeStyle = 'orange'
          ctx.lineWidth = 3
          ctx.rect(
            comment.shape.start.x,
            comment.shape.start.y,
            comment.shape.end.x - comment.shape.start.x,
            comment.shape.end.y - comment.shape.start.y,
          )
          ctx.stroke()

          // Draw comment text above the shape
          ctx.font = '14px Arial'
          ctx.fillStyle = 'white'
          ctx.fillText(
            comment.text,
            comment.shape.start.x,
            comment.shape.start.y - 5,
          )
        }
      }
    })
  }

  const togglePlayPause = async () => {
    try {
      const video = videoRef.current
      if (video.paused) {
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
    <div className="commentPlayer">
      <h2>Comment Playback</h2>
      <div className="videoContainer">
        <video ref={videoRef} src={src} className="video" playsInline />
        <canvas ref={canvasRef} className="drawingCanvas active" />
        <div className="controls">
          <button onClick={togglePlayPause} className="playPauseButton">
            {isPlaying ? <Pause className="icon" /> : <Play className="icon" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentPlayer
