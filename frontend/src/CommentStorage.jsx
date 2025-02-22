import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests

const CommentStorage = ({ comments, videoName }) => {
    const [savedComments, setSavedComments] = useState([]);

    // Generate a default video name using date if none provided
    const getDefaultVideoName = () => {
        const now = new Date();
        return `video_${now.getFullYear()}${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now
            .getHours()
            .toString()
            .padStart(2, "0")}${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
    };

    // Add console.log to debug when component receives new props
    console.log("CommentStorage rendered with:", { comments, videoName });

    const saveCommentsToJson = async () => {
        const commentsData = {
            comments: comments.map((comment) => ({
                title: comment.text,
                time: {
                    start: comment.timeRange.start,
                    end: comment.timeRange.end,
                },
                region: comment.shapeInfo
                    ? {
                          start: {
                              x: comment.shapeInfo.shape.start.x,
                              y: comment.shapeInfo.shape.start.y,
                          },
                          end: {
                              x: comment.shapeInfo.shape.end.x,
                              y: comment.shapeInfo.shape.end.y,
                          },
                      }
                    : null,
                timestamp: new Date().toISOString(),
            })),
        };

        try {
            localStorage.setItem(
                "videoComments",
                JSON.stringify(commentsData, null, 2)
            );
            console.log("Comments saved successfully");
            setSavedComments(commentsData.comments);
        } catch (error) {
            console.error("Error saving comments:", error);
        }
    };

    const handleDownloadJSON = () => {
        // Create a JSON blob
        const jsonData = JSON.stringify({ comments: savedComments }, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "video-comments.json";

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const saveCommentsToServer = async () => {
        const effectiveVideoName = videoName || getDefaultVideoName();

        // Add debug log
        console.log("saveCommentsToServer called with:", {
            comments,
            videoName: effectiveVideoName,
        });

        if (!comments || !comments.length) {
            console.error("No comments to save");
            return;
        }

        const formattedComments = comments.map((comment) => ({
            text: comment.text,
            timeRange: {
                start: comment.timeRange.start,
                end: comment.timeRange.end,
            },
            shapeInfo: comment.shapeInfo
                ? {
                      shape: {
                          start: {
                              x: comment.shapeInfo.shape.start.x,
                              y: comment.shapeInfo.shape.start.y,
                          },
                          end: {
                              x: comment.shapeInfo.shape.end.x,
                              y: comment.shapeInfo.shape.end.y,
                          },
                      },
                  }
                : null,
            timestamp: new Date().toISOString(),
        }));

        console.log("Sending data to server:", {
            videoName: effectiveVideoName,
            comments: formattedComments,
        });

        try {
            const response = await axios.post(
                "http://localhost:5000/api/save-comments",
                {
                    videoName: effectiveVideoName,
                    comments: formattedComments,
                }
            );
            console.log(
                "Comments saved to server successfully:",
                response.data
            );
            console.log("Saved comments JSON:", response.data);
            setSavedComments(formattedComments);
        } catch (error) {
            console.error("Error saving comments to server:", error);
            if (error.response) {
                console.error("Server response:", error.response.data);
            }
        }
    };

    // Add useEffect to monitor comments changes
    useEffect(() => {
        console.log("Comments changed in CommentStorage:", comments.length);
        if (comments.length > 0) {
            saveCommentsToServer();
        }
    }, [comments]); // Add videoName to dependencies if it can change

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h3>Saved Comments: {comments.length}</h3>
                <button
                    onClick={saveCommentsToServer} // Add direct save button for testing
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Save Comments
                </button>
            </div>
            {/* <ul>
                {savedComments.map((comment, index) => (
                    <li key={index}>
                        <strong>Title: {comment.title}</strong>
                        <br />
                        Time: {comment.time.start} - {comment.time.end}
                        {comment.region && (
                            <>
                                <br />
                                Region: ({Math.round(
                                    comment.region.start.x
                                )}, {Math.round(comment.region.start.y)}) to (
                                {Math.round(comment.region.end.x)},{" "}
                                {Math.round(comment.region.end.y)})
                            </>
                        )}
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default CommentStorage;
