import "./Header.css";
import { useContext } from "react";
import { FloorPlanList } from "../../store/floorplan-viewer-store";

function Header() {
  const { dispatch } = useContext(FloorPlanList);

  const handleZoomIn = () => {
    dispatch({ type: "ZOOM", payload: 1.1 }); // Zoom in (increase zoom level)
  };

  const handleZoomOut = () => {
    dispatch({ type: "ZOOM", payload: 0.9 }); // Zoom out (decrease zoom level)
  };
  const handleResetView = () => {
    dispatch({ type: "RESET_VIEW" }); // Reset view to default state
  };

  return (
    <header className="header">
      <h1>2D Floorplan Viewer</h1>
      <div className="controls">
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleResetView}>Reset View</button>
      </div>
    </header>
  );
}

export default Header;
