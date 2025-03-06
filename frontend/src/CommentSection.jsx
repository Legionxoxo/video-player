import React, { useState } from "react";
import MiniPlayer from "./MiniPlayer";
import CommentStorage from "./CommentStorage";
import { MessageCircle, CheckCircle } from "lucide-react";

const formatDate = (date) => {
    return date
        .toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .replace(",", "");
};

const CommentSection = ({
    comment,
    setComment,
    handleSubmitComment,
    comments,
    formatTime,
    videoSrc,
    videoName,
}) => {
    const [resolvedComments, setResolvedComments] = useState({});
    const [replies, setReplies] = useState({});

    const handleResolve = (index) => {
        setResolvedComments((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleReply = (index) => {
        setReplies((prev) => ({
            ...prev,
            [index]: replies[index] !== undefined ? undefined : "",
        }));
    };

    const handleReplyChange = (index, value) => {
        setReplies((prev) => ({
            ...prev,
            [index]: value,
        }));
    };

    const handleReplySubmit = (index) => {
        if (replies[index].trim()) {
            const newReply = {
                text: replies[index],
                timeRange: comments[index].timeRange,
                isReply: true,
            };
            comments.splice(index + 1, 0, newReply);
            setReplies((prev) => ({
                ...prev,
                [index]: undefined,
            }));
        }
    };

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
                    <div
                        key={index}
                        className={`comment ${comment.isReply ? "reply" : ""}`}
                    >
                        <div className="commentContent">
                            <span className="commentName">John</span>
                            <span className="commentEmail">john@gmail.com</span>
                            <span className="timestamp">
                                {formatTime(comment.timeRange.start)}
                                {comment.timeRange.start !==
                                    comment.timeRange.end &&
                                    ` - ${formatTime(comment.timeRange.end)}`}
                            </span>
                            <span className="commentText">{comment.text}</span>
                            <span className="commentTimestamp">
                                {formatDate(new Date())}
                            </span>
                            <div className="commentActions">
                                <MessageCircle
                                    className="icon"
                                    onClick={() => handleReply(index)}
                                />
                                {!comment.isReply && (
                                    <div
                                        onClick={() => handleResolve(index)}
                                        className="resolveAction"
                                    >
                                        {resolvedComments[index] ? (
                                            <>
                                                <CheckCircle className="icon" />
                                                <span className="resolvedText">
                                                    Resolved
                                                </span>
                                            </>
                                        ) : (
                                            <span className="resolveText">
                                                Resolve
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!comment.isReply && (
                            <MiniPlayer
                                videoSrc={videoSrc}
                                startTime={comment.timeRange.start}
                                endTime={comment.timeRange.end}
                                shapeInfo={comment.shapeInfo}
                            />
                        )}
                        {replies[index] !== undefined && (
                            <div className="replyBox">
                                <input
                                    type="text"
                                    value={replies[index]}
                                    onChange={(e) =>
                                        handleReplyChange(index, e.target.value)
                                    }
                                    placeholder="Add a reply..."
                                    className="replyInput"
                                />
                                <button
                                    onClick={() => handleReplySubmit(index)}
                                    className="replyButton"
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CommentSection;
