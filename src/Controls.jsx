import { Play, Pause, Volume2, VolumeX, Pencil } from 'lucide-react'

const Controls = ({
  isPlaying,
  togglePlayPause,
  isDrawMode,
  toggleDrawMode,
  isMuted,
  toggleMute,
  volume,
  adjustVolume,
  playbackRate,
  changeSpeed,
}) => {
  return (
    <div className="controls">
      <button onClick={togglePlayPause} className="playPauseButton">
        {isPlaying ? <Pause className="icon" /> : <Play className="icon" />}
      </button>

      <button
        onClick={toggleDrawMode}
        className={`drawButton ${isDrawMode ? 'active' : ''}`}
        title={isDrawMode ? 'Disable drawing' : 'Enable drawing'}
      >
        <Pencil className="icon" />
      </button>

      <div className="volumeControls">
        <button onClick={toggleMute} className="muteButton">
          {isMuted ? (
            <VolumeX className="icon" />
          ) : (
            <Volume2 className="icon" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={adjustVolume}
          className="volumeSlider"
        />
      </div>

      <div className="speedControls">
        {[0.5, 1, 1.5, 2].map((speed) => (
          <button
            key={speed}
            onClick={() => changeSpeed(speed)}
            className={`speedButton ${playbackRate === speed ? 'active' : ''}`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  )
}

export default Controls
