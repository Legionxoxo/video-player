import React, { useState } from "react";
import {
    Play,
    Pause,
    Volume,
    Volume1,
    Volume2,
    VolumeX,
    Pencil,
} from "lucide-react";

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
    const [showSpeedOptions, setShowSpeedOptions] = useState(false);

    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="icon" />;
        if (volume > 0 && volume <= 0.25) return <Volume className="icon" />;
        if (volume > 0.25 && volume <= 0.5) return <Volume1 className="icon" />;
        if (volume > 0.5 && volume <= 0.75) return <Volume2 className="icon" />;
        return <Volume2 className="icon" />;
    };

    const toggleSpeedOptions = () => {
        setShowSpeedOptions((prev) => !prev);
    };

    return (
        <div className="controls">
            <button onClick={togglePlayPause} className="playPauseButton">
                {isPlaying ? (
                    <Pause className="icon" />
                ) : (
                    <Play className="icon" />
                )}
            </button>

            <button
                onClick={toggleDrawMode}
                className={`drawButton ${isDrawMode ? "active" : ""}`}
                title={isDrawMode ? "Disable drawing" : "Enable drawing"}
            >
                <Pencil className="icon" />
            </button>

            <div className="rightControls">
                <div className="volumeControls">
                    <button onClick={toggleMute} className="muteButton">
                        {getVolumeIcon()}
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
                    <button
                        onClick={toggleSpeedOptions}
                        className="speedButton"
                    >
                        {playbackRate}x
                    </button>
                    {showSpeedOptions && (
                        <div className="speedOptions">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => {
                                        changeSpeed(speed);
                                        setShowSpeedOptions(false);
                                    }}
                                    className={`speedButton ${
                                        playbackRate === speed ? "active" : ""
                                    }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Controls;
