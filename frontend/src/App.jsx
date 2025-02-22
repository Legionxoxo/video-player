import React from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";

function App() {
    return (
        <>
            <h1 className="title">Video Player</h1>
            <VideoPlayer src={"/v2 1h test.mp4"} />
        </>
    );
}

export default App;
