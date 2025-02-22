import React from "react";
import MiniPlayer from "./MiniPlayer";
import CommentStorage from "./CommentStorage";

const CommentSection = ({
    comment,
    setComment,
    handleSubmitComment,
    comments,
    formatTime,
    videoSrc,
    videoName,
}) => {
    const handleInputKeyDown = (e) => {
        if (e.key === " ") {
            e.stopPropagation(); // Prevent space from triggering video play/pause
        }
    };

    console.log("Rendering CommentSection with:", { comments, videoName });

    return (
        <>
            <CommentStorage comments={comments} videoName={videoName} />
            <form onSubmit={handleSubmitComment} className="commentBox">
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Add a comment..."
                    className="commentInput"
                />
                <button type="submit" className="commentButton">
                    Submit
                </button>
            </form>

            <div className="commentList">
                {comments.map((comment, index) => (
                    <div key={index} className="comment">
                        <div className="commentContent">
                            <span className="commentText">{comment.text}</span>
                            {comment.shapeInfo?.shape && (
                                <span className="shapeCoordinates">
                                    Region: (
                                    {Math.round(
                                        comment.shapeInfo.shape.start.x
                                    )}
                                    ,{" "}
                                    {Math.round(
                                        comment.shapeInfo.shape.start.y
                                    )}
                                    ) to (
                                    {Math.round(comment.shapeInfo.shape.end.x)},{" "}
                                    {Math.round(comment.shapeInfo.shape.end.y)})
                                </span>
                            )}
                            <span className="timestamp">
                                Time: {formatTime(comment.timeRange.start)}
                                {comment.timeRange.start !==
                                    comment.timeRange.end &&
                                    ` - ${formatTime(comment.timeRange.end)}`}
                            </span>
                        </div>
                        <MiniPlayer
                            videoSrc={videoSrc}
                            startTime={comment.timeRange.start}
                            endTime={comment.timeRange.end}
                            shapeInfo={comment.shapeInfo}
                        />
                    </div>
                ))}
            </div>
        </>
    );
};

export default CommentSection;
