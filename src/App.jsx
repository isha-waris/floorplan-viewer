import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./components/Header/Header";
import FloorPlanListProvider from "./store/floorplan-viewer-store";
// import Regions from "./components/Regions/Regions";
// import FloorPlanViewer from "./components/FloorPlanViewer/FloorPlanViewer";
import DrawFloorPlan from "./components/DrawFloorPlan";

function App() {
  return (
    <FloorPlanListProvider>
      <Header />
      <DrawFloorPlan />
    </FloorPlanListProvider>
  );
}

export default App;
