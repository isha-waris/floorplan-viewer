import { useContext, useEffect, useRef, useState } from "react";
import { FloorPlanList } from "../store/floorplan-viewer-store";

const DrawFloorPlan = () => {
  const { state } = useContext(FloorPlanList);
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hoveredFurniture, setHoveredFurniture] = useState(null);

  const scale = 5; // Set a fixed scale for the original dimensions of elements

  // Function to calculate rotated bounding box
  const calculateRotatedBounds = (x, y, width, height, rotation) => {
    if (rotation === 0) {
      return { x, y, width, height };
    }

    const cosTheta = Math.cos(rotation);
    const sinTheta = Math.sin(rotation);

    const x1 = x;
    const y1 = y;
    const x2 = x + width * cosTheta;
    const y2 = y + width * sinTheta;
    const x3 = x - height * sinTheta;
    const y3 = y + height * cosTheta;
    const x4 = x2 - height * sinTheta;
    const y4 = y2 + height * cosTheta;

    const minX = Math.min(x1, x2, x3, x4);
    const maxX = Math.max(x1, x2, x3, x4);
    const minY = Math.min(y1, y2, y3, y4);
    const maxY = Math.max(y1, y2, y3, y4);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply panning offsets
    ctx.save();
    ctx.translate(offset.x, offset.y);

    // Apply zoom transformation separately
    ctx.scale(state.zoomLevel, state.zoomLevel);

    // Draw regions (walls)
    if (Array.isArray(state.regions) && state.regions.length > 0) {
      state.regions.forEach((region) => {
        if (region.length === 2) {
          const [start, end] = region;
          if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.X * scale, start.Y * scale);
            ctx.lineTo(end.X * scale, start.Y * scale);
            ctx.lineTo(end.X * scale, end.Y * scale);
            ctx.lineTo(start.X * scale, end.Y * scale);
            ctx.closePath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      });
    }

    // Draw doors
    if (Array.isArray(state.doors) && state.doors.length > 0) {
      state.doors.forEach((door) => {
        const { Location, Width, Rotation } = door;
        if (Location) {
          const x = Location.X * scale;
          const y = Location.Y * scale;
          const doorHeight = 50; // Fixed door height, unaffected by zoom

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Rotation);
          ctx.fillStyle = "#555";
          ctx.strokeStyle = "blue";
          ctx.fillRect(0, 0, Width * scale, doorHeight);
          ctx.strokeRect(0, 0, Width * scale, doorHeight);
          ctx.restore();
        }
      });
    }

    // Draw furniture
    if (Array.isArray(state.furniture) && state.furniture.length > 0) {
      state.furniture.forEach((furniture) => {
        const { MinBound, MaxBound, xPlacement, yPlacement, rotation, name } =
          furniture;
        if (xPlacement && yPlacement) {
          const furnitureX = xPlacement * scale;
          const furnitureY = yPlacement * scale;
          const furnitureWidth = Math.max(
            20,
            (MaxBound.X - MinBound.X) * scale
          );
          const furnitureHeight = Math.max(
            20,
            (MaxBound.Y - MinBound.Y) * scale
          );

          ctx.save();
          ctx.translate(furnitureX, furnitureY);
          ctx.rotate(rotation);
          ctx.fillStyle = "darkblue";
          ctx.fillRect(0, 0, furnitureWidth, furnitureHeight);
          ctx.strokeStyle = "blue";
          ctx.strokeRect(0, 0, furnitureWidth, furnitureHeight);
          ctx.restore();

          const rotatedBounds = calculateRotatedBounds(
            furnitureX,
            furnitureY,
            furnitureWidth,
            furnitureHeight,
            rotation
          );

          furniture.bounds = {
            ...rotatedBounds,
            name: name,
          };
        }
      });
    }

    ctx.restore(); // Restore the context to its previous state before the next render
  }, [state, offset]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / state.zoomLevel;
    const y = (e.clientY - rect.top - offset.y) / state.zoomLevel;

    if (isPanning) {
      const newOffsetX = e.clientX - panStart.x;
      const newOffsetY = e.clientY - panStart.y;
      setOffset({ x: newOffsetX, y: newOffsetY });
    } else {
      const hoveredFurniture = state.furniture.filter((furniture) => {
        const { bounds } = furniture;
        return (
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        );
      });

      if (hoveredFurniture.length > 0) {
        setHoveredFurniture(hoveredFurniture[0].name);
      } else {
        setHoveredFurniture(null);
      }
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={(e) => {
          setIsPanning(true);
          setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => setIsPanning(false)}
      ></canvas>
      {hoveredFurniture && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "white",
            border: "1px solid black",
            padding: "5px",
            zIndex: 1000,
          }}
        >
          {hoveredFurniture}
        </div>
      )}
    </div>
  );
};

export default DrawFloorPlan;
