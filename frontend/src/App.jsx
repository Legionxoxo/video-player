import React from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";

function App() {
    return (
        <>
            <h1 className="text-red-500 text-center">Video Player</h1>
            <VideoPlayer src={"/v2 1h test.mp4"} />
        </>
    );
}

export default App;
