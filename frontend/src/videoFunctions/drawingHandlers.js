export const getPointerPosition = (e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
};

export const startDrawing = (
    e,
    isDrawMode,
    setIsDrawing,
    videoRef,
    setIsPlaying,
    canvasRef,
    setStartPoint,
    setEndPoint,
    setInputBoxPosition
) => {
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

export const draw = (
    e,
    isDrawing,
    isDrawMode,
    canvasRef,
    startPoint,
    setEndPoint
) => {
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

export const endDrawing = (
    isDrawMode,
    setIsDrawing,
    canvasRef,
    setInputBoxPosition,
    videoRef,
    setTimelineSelection,
    generatePreviewFrames,
    setInputBoxVisible
) => {
    if (!isDrawMode) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.bottom - 280;

    setInputBoxPosition({
        x: centerX,
        y: centerY,
    });

    const video = videoRef.current;
    const start = video.currentTime;
    const end = Math.min(start + 5, video.duration);
    setTimelineSelection({ start, end });

    generatePreviewFrames(start, end);

    setInputBoxVisible(true);
};
