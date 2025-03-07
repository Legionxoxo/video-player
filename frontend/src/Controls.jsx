import React, { useState } from "react";
import {
    Play,
    Pause,
    Volume,
    Volume1,
    Volume2,
    VolumeX,
    Pencil,
    Maximize,
    Minimize,
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
    showComments,
    toggleComments,
}) => {
    const [showSpeedOptions, setShowSpeedOptions] = useState(false);

    const getVolumeIcon = () => {
        if (isMuted || volume === 0)
            return <VolumeX className="h-8 w-8 text-[#969696]" />;
        if (volume > 0 && volume <= 0.25)
            return <Volume className="h-8 w-8 text-[#969696]" />;
        if (volume > 0.25 && volume <= 0.5)
            return <Volume1 className="h-8 w-8 text-[#969696]" />;
        if (volume > 0.5 && volume <= 0.75)
            return <Volume2 className="h-8 w-8 text-[#969696]" />;
        return <Volume2 className="h-8 w-8 text-[#969696]" />;
    };

    const toggleSpeedOptions = () => {
        setShowSpeedOptions((prev) => !prev);
    };

    return (
        <div className="controls">
            <button onClick={togglePlayPause} className="playPauseButton">
                {isPlaying ? (
                    <Pause className="icon ml-8 mt-1" />
                ) : (
                    <Play fill="white" className="icon ml-8 mt-1" />
                )}
            </button>

            <button
                onClick={toggleDrawMode}
                className={`drawButton ${isDrawMode ? "" : ""}`}
                title={isDrawMode ? "Disable drawing" : "Enable drawing"}
            >
                {/*  <Pencil className="icon" /> */}
            </button>

            <div className="rightControls">
                <div className="volumeControls relative z-10">
                    <button onClick={toggleMute} className="muteButton">
                        {getVolumeIcon()}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                            adjustVolume(e.target.value);
                            e.target.style.setProperty(
                                "--volume-level",
                                `${e.target.value * 100}%`
                            );
                        }}
                        className="volumeSlider w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #007bff ${
                                volume * 100
                            }%, #ccc ${volume * 100}%)`,
                        }}
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

                <button
                    onClick={toggleComments}
                    className="toggleCommentsButton"
                >
                    {showComments ? (
                        <Maximize className="icon cursor-pointer mr-8 -ml-2" />
                    ) : (
                        <Minimize className="icon cursor-pointer mr-8 -ml-2" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Controls;
