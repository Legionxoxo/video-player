import React, { useState, useCallback } from 'react'

const ProgressBar = ({
  progressRef,
  currentTime,
  duration,
  timelineSelection,
  handleProgressChange,
  handleTimelineStart,
  handleTimelineMove,
  handleTimelineEnd,
  formatTime,
  previewFrames = [],
  videoRef,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [previewTime, setPreviewTime] = useState(null)
  const [hoverPosition, setHoverPosition] = useState(null)

  const getTimeFromEvent = useCallback(
    (e) => {
      if (!progressRef.current) return null
      const rect = progressRef.current.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      return (x / rect.width) * duration
    },
    [duration],
  )

  const handleSeek = (e) => {
    if (!progressRef.current || !videoRef.current) return
    const seekTime = getTimeFromEvent(e)
    if (seekTime !== null) {
      videoRef.current.currentTime = seekTime
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    const time = getTimeFromEvent(e)
    if (time !== null) {
      setIsDragging(true)
      handleTimelineStart({
        clientX: e.touches ? e.touches[0].clientX : e.clientX,
        time,
      })
      handleSeek(e)
    }
  }

  const handleMove = useCallback(
    (e) => {
      if (!progressRef.current) return
      const time = getTimeFromEvent(e)

      if (time !== null) {
        setPreviewTime(time)
        setHoverPosition(time)

        if (isDragging) {
          e.preventDefault()
          handleTimelineMove({
            clientX: e.touches ? e.touches[0].clientX : e.clientX,
            time,
          })
        }
      }
    },
    [isDragging, getTimeFromEvent, handleTimelineMove],
  )

  const handleEnd = (e) => {
    if (isDragging) {
      const time = getTimeFromEvent(e)
      if (time !== null) {
        handleTimelineEnd({ time })
      }
    }
    setIsDragging(false)
  }

  const handleClick = (e) => {
    if (!isDragging) {
      handleSeek(e)
    }
  }

  return (
    <div className="progressBarContainer">
      <div
        ref={progressRef}
        className="progressBar"
        onClick={handleClick}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
        onMouseLeave={() => {
          if (isDragging) {
            handleTimelineEnd()
          }
          setIsDragging(false)
          setPreviewTime(null)
          setHoverPosition(null)
        }}
        onTouchCancel={() => {
          if (isDragging) {
            handleTimelineEnd()
          }
          setIsDragging(false)
          setPreviewTime(null)
          setHoverPosition(null)
        }}
      >
        <div
          className="progress"
          style={{
            width: `${(currentTime / duration) * 100}%`,
            transition: isDragging ? 'none' : 'width 0.1s linear',
          }}
        />
        {/* Show hover time indicator */}
        {hoverPosition !== null && !isDragging && (
          <div
            className="hoverTimeIndicator"
            style={{
              left: `${(hoverPosition / duration) * 100}%`,
            }}
          >
            <span className="timeTooltip">{formatTime(hoverPosition)}</span>
          </div>
        )}
        {timelineSelection?.start !== null && (
          <>
            <div
              className="timelineSelection"
              style={{
                left: `${
                  (Math.min(timelineSelection.start, timelineSelection.end) /
                    duration) *
                  100
                }%`,
                width: `${
                  (Math.abs(timelineSelection.end - timelineSelection.start) /
                    duration) *
                  100
                }%`,
              }}
            />
            {previewFrames?.length > 0 && (
              <div
                className="previewStrip"
                style={{
                  left: `${
                    (Math.min(timelineSelection.start, timelineSelection.end) /
                      duration) *
                    100
                  }%`,
                  width: `${
                    (Math.abs(timelineSelection.end - timelineSelection.start) /
                      duration) *
                    100
                  }%`,
                }}
              >
                {previewFrames.map((frame, index) => (
                  <img
                    key={index}
                    src={frame.src}
                    className={`previewFrame ${
                      previewTime && Math.abs(frame.time - previewTime) < 0.1
                        ? 'active'
                        : ''
                    }`}
                    alt={`Preview at ${formatTime(frame.time)}`}
                    style={{
                      width: `${100 / previewFrames.length}%`,
                    }}
                  />
                ))}
              </div>
            )}
            <div
              className="timelineMarker start"
              style={{
                left: `${(timelineSelection.start / duration) * 100}%`,
              }}
            >
              <span className="timeTooltip">
                {formatTime(timelineSelection.start)}
              </span>
            </div>
            <div
              className="timelineMarker end"
              style={{
                left: `${(timelineSelection.end / duration) * 100}%`,
              }}
            >
              <span className="timeTooltip">
                {formatTime(timelineSelection.end)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProgressBar
