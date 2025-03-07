"use client";

import { useState, useRef, useEffect } from "react";
import VideoControls from "./Controls";
import ProgressBar from "./ProgressBar";
import CommentSection from "./CommentSection";
import DrawingCanvas from "./DrawingCanvas";
import "./styles/VideoPlayer.css";
import { Pause, Pen, PenOff, Play, Square, SquareDashed } from "lucide-react";

const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const progressRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [comments, setComments] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
    const [comment, setComment] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [timelineSelection, setTimelineSelection] = useState({
        start: null,
        end: null,
    });
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [previewFrames, setPreviewFrames] = useState([]);
    const [showComments, setShowComments] = useState(true);
    const [inputBoxPosition, setInputBoxPosition] = useState(null);
    const [activeTool, setActiveTool] = useState("play");

    const getPointerPosition = (e, rect) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const handleResize = () => {
            const videoRect = video.getBoundingClientRect();
            canvas.width = videoRect.width;
            canvas.height = videoRect.height;
        };

        video.addEventListener("loadedmetadata", () => {
            setDuration(video.duration);
            handleResize();
        });

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        window.addEventListener("resize", handleResize);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        return () => {
            video.removeEventListener("loadedmetadata", handleResize);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const togglePlayPause = async () => {
        try {
            const video = videoRef.current;
            if (video.paused) {
                await video.play();
                setIsPlaying(true);
                setActiveTool("play");
            } else {
                video.pause();
                setIsPlaying(false);
            }
        } catch (error) {
            console.error("Error toggling play/pause:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.code === "Space") {
            e.preventDefault();
            togglePlayPause();
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    const changeSpeed = (speed) => {
        const video = videoRef.current;
        video.playbackRate = speed;
        setPlaybackRate(speed);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        video.muted = !video.muted;
        setIsMuted(!isMuted);
    };

    const adjustVolume = (e) => {
        const newVolume = parseFloat(e.target.value);
        const video = videoRef.current;
        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const handleProgressChange = (e) => {
        const progressBar = progressRef.current;
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = (x / rect.width) * duration;
        videoRef.current.currentTime = newTime;
    };

    const startDrawing = (e) => {
        if (!isDrawMode) return;
        setIsDrawing(true);

        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = canvas.getBoundingClientRect();
        const point = getPointerPosition(e, rect);
        setStartPoint(point);
        setEndPoint(point);
        setInputBoxPosition(null);
    };

    const draw = (e) => {
        if (!isDrawing || !isDrawMode) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = canvas.getBoundingClientRect();
        const currentPoint = getPointerPosition(e, rect);
        setEndPoint(currentPoint);

        ctx.beginPath();
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 3;
        ctx.rect(
            startPoint.x,
            startPoint.y,
            currentPoint.x - startPoint.x,
            currentPoint.y - startPoint.y
        );
        ctx.stroke();
    };

    const endDrawing = () => {
        if (!isDrawMode) return;
        setIsDrawing(false);

        // Set the position for the input box next to the drawn region
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.bottom - 280; // 10px below the canvas

        setInputBoxPosition({
            x: centerX,
            y: centerY,
        });
    };

    const formatTime = (timestamp) => {
        const minutes = Math.floor(timestamp / 60);
        const seconds = Math.floor(timestamp % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const handleTimelineStart = (e) => {
        if (!progressRef.current) return;

        setTimelineSelection({
            start: e.time,
            end: e.time,
        });
    };

    const handleTimelineMove = (e) => {
        if (!progressRef.current || timelineSelection.start === null) return;

        setTimelineSelection((prev) => ({
            ...prev,
            end: e.time,
        }));
    };

    const handleTimelineEnd = (e) => {
        if (!timelineSelection.start || !timelineSelection.end) {
            setTimelineSelection({ start: null, end: null });
            return;
        }

        const start = Math.min(timelineSelection.start, timelineSelection.end);
        const end = Math.max(timelineSelection.start, timelineSelection.end);

        if (Math.abs(end - start) < 0.1) {
            setTimelineSelection({ start: null, end: null });
        } else {
            generatePreviewFrames(start, end);
        }
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
        }
    };

    const toggleDrawMode = () => {
        const newDrawMode = !isDrawMode;
        setIsDrawMode(newDrawMode);
        clearCanvas();

        if (!newDrawMode) {
            setInputBoxPosition(null); // Close the input box when draw mode is disabled
        } else {
            setActiveTool("draw"); // Set active tool to draw
            if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause(); // Pause the video if it's playing
                setIsPlaying(false);
            }
        }
    };

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            // Get the video element and its display dimensions
            const video = videoRef.current;
            const videoRect = video.getBoundingClientRect();

            // Calculate the actual display dimensions and offsets of the video
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;
            const containerWidth = videoRect.width;
            const containerHeight = videoRect.height;

            let displayWidth,
                displayHeight,
                offsetX = 0,
                offsetY = 0;

            const containerAspectRatio = containerWidth / containerHeight;
            const videoAspectRatio = videoWidth / videoHeight;

            if (containerAspectRatio > videoAspectRatio) {
                // Container is wider than video
                displayHeight = containerHeight;
                displayWidth = displayHeight * videoAspectRatio;
                offsetX = (containerWidth - displayWidth) / 2;
            } else {
                // Container is taller than video
                displayWidth = containerWidth;
                displayHeight = displayWidth / videoAspectRatio;
                offsetY = (containerHeight - displayHeight) / 2;
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
            };

            const newComment = {
                text: comment,
                timeRange:
                    timelineSelection.start !== null &&
                    timelineSelection.end !== null
                        ? {
                              start: Math.min(
                                  timelineSelection.start,
                                  timelineSelection.end
                              ),
                              end: Math.max(
                                  timelineSelection.start,
                                  timelineSelection.end
                              ),
                          }
                        : { start: currentTime, end: currentTime },
                shapeInfo,
            };
            setComments([...comments, newComment]);
            setComment("");
            setTimelineSelection({ start: null, end: null });

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            setInputBoxPosition(null);
        }
        setIsDrawMode(false);
        setIsDrawing(false);
        setStartPoint({ x: 0, y: 0 });
        setEndPoint({ x: 0, y: 0 });
    };

    const generatePreviewFrames = async (start, end) => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const wasPlaying = !video.paused;
        const currentTime = video.currentTime;

        try {
            if (wasPlaying) {
                await video.pause();
            }

            const frames = [];
            const numFrames = 5;
            const interval = (end - start) / (numFrames - 1);

            for (let i = 0; i < numFrames; i++) {
                const frameTime = start + i * interval;
                video.currentTime = frameTime;

                await new Promise((resolve) => {
                    video.onseeked = resolve;
                });

                const canvas = document.createElement("canvas");
                canvas.width = 160;
                canvas.height = 90;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                frames.push({
                    time: frameTime,
                    src: canvas.toDataURL("image/jpeg", 0.7),
                });
            }

            setPreviewFrames(frames);

            // Restore video state
            video.currentTime = currentTime;
            if (wasPlaying) {
                await video.play();
            }
        } catch (error) {
            console.error("Error generating preview frames:", error);
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    return (
        <div className="flex h-screen bg-[#181818] overflow-hidden">
            <div
                className={`flex-2 flex flex-col transition-width duration-300 ease-in-out ${
                    !showComments ? "flex-1" : "w-3/4"
                }`}
            >
                <div className="relative flex-1 flex items-center justify-center bg-black mt-28">
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

                    {/* Comment input form */}
                    {inputBoxPosition && (
                        <>
                            <div
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 999,
                                }}
                                onClick={() => {
                                    setComment("");
                                    setInputBoxPosition(null);
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    left: inputBoxPosition.x,
                                    top: inputBoxPosition.y,
                                    transform: "translateX(-50%)",
                                    backgroundColor: "#FFFFFF",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                                    zIndex: 1000,
                                }}
                            >
                                <form onSubmit={handleSubmitComment}>
                                    <div className="flex items-center justify-between ml-2">
                                        <h1 className="text-black ml-2">
                                            Comment
                                        </h1>
                                        <div className="flex items-center justify-between gap-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setComment("");
                                                    setInputBoxPosition(null);
                                                }}
                                                className="text-[#000000] cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <div className="bg-[#FF9F40] px-3 py-1  cursor-pointer rounded-md ml-3 mr-3 my-1">
                                                <button
                                                    type="submit"
                                                    className="text-[#000000] cursor-pointer"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <textarea
                                        type="text"
                                        value={comment}
                                        onChange={(e) =>
                                            setComment(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === " ") {
                                                e.stopPropagation();
                                            }
                                        }}
                                        placeholder="Add a comment..."
                                        className="border-2 border-[#D9D9D9] rounded-lg px-4 py-4 text-[#000000] w-[440px] h-[100px] mx-3 my-1 focus:outline-none focus:border-blue-500 placeholder-[#969696]"
                                        autoFocus
                                    />
                                </form>
                            </div>
                        </>
                    )}

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
                        showComments={showComments}
                        toggleComments={toggleComments}
                    />

                    {/* Container for progress bar and speed control */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
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
                            showComments={showComments}
                            style={{
                                width: showComments ? "50%" : "80%",
                            }}
                        />
                    </div>
                </div>

                {/* Play and Draw buttons */}
                <div className="my-10">
                    <div className="flex items-center justify-center rounded-full">
                        <div className="bg-[#5A5A5A] rounded-full p-4 flex items-center justify-center gap-x-6 ">
                            <button
                                className={`bg-white rounded-full p-2 ${
                                    activeTool === "play" ? "active" : ""
                                }`}
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? (
                                    <Play
                                        fill="#969696"
                                        className="cursor-pointer w-8 h-8 text-[#969696] "
                                    />
                                ) : (
                                    <Play
                                        /* fill="#969696" */
                                        className="cursor-pointer w-8 h-8 text-[#969696] "
                                    />
                                )}
                            </button>
                            <button
                                className={`rounded-full p-2 ${
                                    activeTool === "draw" ? "active" : ""
                                }`}
                                onClick={toggleDrawMode}
                            >
                                {isDrawMode ? (
                                    <Square className="cursor-pointer w-7 h-7" />
                                ) : (
                                    <SquareDashed className="cursor-pointer w-7 h-7" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`comment-section bg-[#d9d9d9] ${
                    !showComments ? "hidden" : "w-1/4"
                }`}
            >
                <CommentSection
                    comment={comment}
                    setComment={setComment}
                    handleSubmitComment={handleSubmitComment}
                    comments={comments}
                    formatTime={formatTime}
                    videoSrc={src}
                />
            </div>
        </div>
    );
};

export default VideoPlayer;
