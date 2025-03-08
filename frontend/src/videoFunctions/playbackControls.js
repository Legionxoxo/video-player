export const togglePlayPause = async (videoRef, setIsPlaying) => {
    try {
        const video = videoRef.current;
        if (video.paused) {
            await video.play();
        } else {
            video.pause();
            setIsPlaying(false);
        }
    } catch (error) {
        console.error("Error toggling play/pause:", error);
    }
};

export const changeSpeed = (speed, videoRef, setPlaybackRate) => {
    const video = videoRef.current;
    video.playbackRate = speed;
    setPlaybackRate(speed);
};

export const toggleMute = (videoRef, setIsMuted) => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!video.muted);
};

export const adjustVolume = (e, videoRef, setVolume, setIsMuted) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
};
