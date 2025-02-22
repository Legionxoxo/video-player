const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route to fetch all comments
app.get("/api/comments", (req, res) => {
    const commentsFilePath = path.join(__dirname, "../frontend/comments.json");

    fs.readFile(commentsFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading comments:", err);
            return res.status(500).json({ error: "Failed to read comments" });
        }
        try {
            const comments = JSON.parse(data);
            res.json(comments);
        } catch (parseErr) {
            console.error("Error parsing comments file:", parseErr);
            res.status(500).json({ error: "Failed to parse comments" });
        }
    });
});

// Route to save comments for each video
app.post("/api/save-comments", (req, res) => {
    console.log("Received request to save comments:", req.body);
    const { videoName, comments } = req.body;

    // Validate request data
    if (!videoName || typeof videoName !== "string") {
        console.error("Validation error: Invalid videoName");
        return res.status(400).json({
            error: "Invalid videoName",
            details: "videoName must be a non-empty string",
        });
    }

    if (!Array.isArray(comments)) {
        console.error("Validation error: Invalid comments");
        return res.status(400).json({
            error: "Invalid comments",
            details: "comments must be an array",
        });
    }

    // Validate each comment
    const isValidComment = (comment) => {
        return (
            comment &&
            typeof comment.text === "string" &&
            comment.timeRange &&
            typeof comment.timeRange.start === "number" &&
            typeof comment.timeRange.end === "number"
        );
    };

    if (!comments.every(isValidComment)) {
        console.error("Validation error: Invalid comment format");
        return res.status(400).json({
            error: "Invalid comment format",
            details: "Each comment must have text and timeRange properties",
        });
    }

    console.log("Received valid comments for video:", videoName);
    console.log("Number of comments:", comments.length);

    const commentsDir = path.join(__dirname, "../comment-json");

    // Ensure comments directory exists
    if (!fs.existsSync(commentsDir)) {
        try {
            fs.mkdirSync(commentsDir, { recursive: true });
            console.log("Created comments directory:", commentsDir);
        } catch (err) {
            console.error("Error creating comments directory:", err);
            return res
                .status(500)
                .json({ error: "Failed to create comments directory" });
        }
    } else {
        console.log("Comments directory already exists:", commentsDir);
    }

    const filePath = path.join(commentsDir, `${videoName}.json`);
    console.log("File path for saving comments:", filePath);

    let existingComments = [];
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, "utf8");
            existingComments = JSON.parse(fileData).comments || [];
            console.log("Loaded existing comments:", existingComments);
        } catch (err) {
            console.error("Error reading existing comments:", err);
            return res
                .status(500)
                .json({ error: "Failed to read existing comments" });
        }
    } else {
        console.log("No existing comments found for video:", videoName);
    }

    const updatedComments = [...existingComments, ...comments];
    console.log("Updated comments to be saved:", updatedComments);

    // Save updated comments to file
    fs.writeFile(
        filePath,
        JSON.stringify({ comments: updatedComments }, null, 2),
        (err) => {
            if (err) {
                console.error("Failed to save comments:", err);
                return res
                    .status(500)
                    .json({ error: "Failed to save comments" });
            }
            console.log("Comments saved successfully for video:", videoName);
            res.status(200).json({ message: "Comments saved successfully" });
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("Server started, waiting for requests...");
});
