const DrawingCanvas = ({
  canvasRef,
  isDrawMode,
  startDrawing,
  draw,
  endDrawing,
}) => {
  return (
    <canvas
      ref={canvasRef}
      className={`drawingCanvas ${isDrawMode ? 'active' : ''}`}
      onMouseDown={startDrawing}
      onTouchStart={startDrawing}
      onMouseMove={draw}
      onTouchMove={draw}
      onMouseUp={endDrawing}
      onTouchEnd={endDrawing}
      onMouseLeave={endDrawing}
      onTouchCancel={endDrawing}
    />
  )
}

export default DrawingCanvas
