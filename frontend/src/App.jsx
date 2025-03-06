import React from "react";
import "./App.css";
import VideoPlayer from "./VideoPlayer";

function App() {
    return (
        <>
            <VideoPlayer src={"/v2 1h test.mp4"} />
        </>
    );
}

export default App;
