// FloorPlanListProvider.js
import { createContext, useReducer, useEffect } from "react";
import PropTypes from "prop-types";

export const FloorPlanList = createContext();

const DEFAULT_STATE = {
  regions: [],
  doors: [],
  furniture: [], // Ensure furniture includes all necessary properties
  zoomLevel: 1, // Default zoom level
  offsetX: 0, // Pan offset on the X-axis
  offsetY: 0, // Pan offset on the Y-axis
  hoveredFurniture: null, // To store hovered furniture
};

const floorPlanReducer = (state, action) => {
  switch (action.type) {
    case "SET_REGIONS":
      return { ...state, regions: action.payload };
    case "SET_DOORS":
      return { ...state, doors: action.payload };
    case "SET_FURNITURE":
      return { ...state, furniture: action.payload };
    case "PAN": {
      const { furnitureId, dx, dy } = action.payload;
      const furniture = state.furniture.find((f) => f.id === furnitureId);
      if (furniture) {
        // Update furniture position if needed
        furniture.x += dx;
        furniture.y += dy;
        // Return updated furniture state
        return { ...state, furniture: [...state.furniture] };
      }
      return state;
    }
    // floorPlanReducer.js
    case "ZOOM": {
      const newZoomLevel = state.zoomLevel * action.payload;
      return { ...state, zoomLevel: newZoomLevel };
    }
    case "RESET_VIEW":
      return {
        ...state,
        zoomLevel: 1, // Reset zoom to default
        offset: { x: 0, y: 0 }, // Reset offset to default
      };

    case "SET_CENTER":
      return { ...state, centerX: action.payload.x, centerY: action.payload.y };
    case "HOVER_FURNITURE":
      return { ...state, hoveredFurniture: action.payload };
    default:
      return state;
  }
};

const FloorPlanListProvider = ({ children }) => {
  const [state, dispatch] = useReducer(floorPlanReducer, DEFAULT_STATE);

  useEffect(() => {
    fetch("/sample.json")
      .then((response) => response.json())
      .then((data) => {
        dispatch({ type: "SET_REGIONS", payload: data.SET_REGIONS });
        dispatch({ type: "SET_DOORS", payload: data.SET_DOORS });
        dispatch({ type: "SET_FURNITURE", payload: data.SET_FURNITURE });
        console.log(data); // Log data for verification
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });
  }, []);

  return (
    <FloorPlanList.Provider value={{ state, dispatch }}>
      {children}
    </FloorPlanList.Provider>
  );
};

export default FloorPlanListProvider;

FloorPlanListProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
