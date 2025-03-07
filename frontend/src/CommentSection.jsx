import React, { useState } from "react";
import MiniPlayer from "./MiniPlayer";
import { MessageCircle, Check, CheckCheck, X } from "lucide-react";

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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-x-2">
                <h1 className="text-black text-3xl font-bold ml-5 mt-4">
                    Comments
                </h1>
                {/* <button
                    onClick={() => setShowComments(false)}
                    className="mt-4 mr-4"
                >
                    <X className="w-8 h-8 cursor-pointer text-[#969696]" />
                </button> */}
            </div>

            <div className="border-b border-zinc-500 w-full" />
            {comments.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-center text-gray-500 mt-4 px-6 py-6 text-lg">
                        All your conversation will appear here. You can select
                        the area to highlight, select the timeline, and you are
                        good to go.
                    </p>
                </div>
            ) : (
                comments.map((comment, index) => (
                    <div
                        key={index}
                        className={`flex flex-col justify-between border rounded-xl bg-[#f6f6f6] m-5 ${
                            comment.isReply
                                ? "ml-20 -mt-3 rounded-xl text-white flex flex-col"
                                : ""
                        }`}
                    >
                        <div className="p-5">
                            <span className=" text-[20px] text-[#000000]">
                                John
                            </span>
                            <br />
                            <span className=" text-sm text-[#969696] font-medium">
                                john@gmail.com
                            </span>
                            <span className=" text-sm">
                                <p className="text-[#969696] italic my-1">
                                    {formatTime(comment.timeRange.start)}
                                    {comment.timeRange.start !==
                                        comment.timeRange.end &&
                                        ` to ${formatTime(
                                            comment.timeRange.end
                                        )}`}
                                </p>
                            </span>
                            <span className=" text-[#434343] text-[16px] text-pretty">
                                <p className="mt-2">{comment.text}</p>
                            </span>

                            <span className=" text-[#969696] text-sm italic">
                                <p className="my-3">{formatDate(new Date())}</p>
                            </span>
                            <div className="flex flex-row gap-x-6">
                                <MessageCircle
                                    className="text-[#969696] w-8 h-8 cursor-pointer"
                                    onClick={() => handleReply(index)}
                                />

                                {!comment.isReply && (
                                    <div
                                        onClick={() => handleResolve(index)}
                                        className=""
                                    >
                                        {resolvedComments[index] ? (
                                            <>
                                                <div className="flex flex-row gap-1 cursor-pointer">
                                                    <CheckCheck className="w-8 h-8 cursor-pointer text-[#969696]" />
                                                    <span className="text-[#969696] text-center text-sm mt-[7px] ml-1">
                                                        Resolved
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="flex flex-row text-[#969696] gap-1 cursor-pointer">
                                                <Check className="w-8 h-8 cursor-pointer" />
                                                <p className="text-[#969696] text-center text-sm mt-[7px]">
                                                    Resolve
                                                </p>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!comment.isReply && (
                            <div className="-mt-2 ml-5 mb-4">
                                <MiniPlayer
                                    videoSrc={videoSrc}
                                    startTime={comment.timeRange.start}
                                    endTime={comment.timeRange.end}
                                    shapeInfo={comment.shapeInfo}
                                />
                            </div>
                        )}
                        {replies[index] !== undefined && (
                            <div className="flex flex-row mb-4">
                                <input
                                    type="text"
                                    value={replies[index]}
                                    onChange={(e) =>
                                        handleReplyChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === " ") {
                                            e.stopPropagation(); // Prevent space from triggering video play/pause
                                        }
                                    }}
                                    placeholder="Add a reply..."
                                    className="border-1 border-gray-300 rounded-md px-3 py-2 text-black mt-3 ml-5"
                                />
                                <button
                                    onClick={() => handleReplySubmit(index)}
                                    className="text-[#000000] text-lg font-medium px-4 py-2 rounded-md mt-3 cursor-pointer ml-2"
                                >
                                    Reply
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default CommentSection;
