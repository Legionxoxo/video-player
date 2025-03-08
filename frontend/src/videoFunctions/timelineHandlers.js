export const handleTimelineStart = (
    e,
    progressRef,
    timelineSelection,
    setInputBoxVisible,
    setDraggingPoint,
    setTimelineSelection
) => {
    if (!progressRef.current) return;

    const time = e.time;
    const start = timelineSelection.start;
    const end = timelineSelection.end;

    setInputBoxVisible(false);

    const startDistance = Math.abs(time - start);
    const endDistance = Math.abs(time - end);

    if (startDistance < endDistance) {
        setDraggingPoint("start");
        setTimelineSelection({ start: time, end });
    } else {
        setDraggingPoint("end");
        setTimelineSelection({ start, end: time });
    }
};

export const handleTimelineMove = (
    e,
    progressRef,
    draggingPoint,
    setTimelineSelection
) => {
    if (!progressRef.current || draggingPoint === null) return;

    const time = e.time;

    if (draggingPoint === "start") {
        setTimelineSelection((prev) => ({
            ...prev,
            start: time,
        }));
    } else if (draggingPoint === "end") {
        setTimelineSelection((prev) => ({
            ...prev,
            end: time,
        }));
    }
};

export const handleTimelineEnd = (
    draggingPoint,
    timelineSelection,
    setTimelineSelection,
    generatePreviewFrames,
    setInputBoxVisible
) => {
    if (draggingPoint === null) return;

    const start = Math.min(timelineSelection.start, timelineSelection.end);
    const end = Math.max(timelineSelection.start, timelineSelection.end);

    if (Math.abs(end - start) < 0.1) {
        setTimelineSelection({ start: null, end: null });
    } else {
        generatePreviewFrames(start, end);
    }

    setInputBoxVisible(true);
};
