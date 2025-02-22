import React, { useEffect, useState } from "react";
import fs from "fs";

const CommentStorage = ({ comments }) => {
    const [savedComments, setSavedComments] = useState([]);

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

    useEffect(() => {
        saveCommentsToJson();
    }, [comments]);

    return (
        <div>
            <h3>Saved Comments:</h3>
            <ul>
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
            </ul>
        </div>
    );
};

export default CommentStorage;
