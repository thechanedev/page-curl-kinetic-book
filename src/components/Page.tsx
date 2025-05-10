
import React from "react";
import { cn } from "@/lib/utils";

interface PageProps {
  pageNumber: number;
  isActive: boolean;
  isFlipping: boolean;
  isDragging: boolean;
  dragPercentage: number;
  flipDirection: "forward" | "backward";
  zIndex: number;
}

const Page: React.FC<PageProps> = ({
  pageNumber,
  isActive,
  isFlipping,
  isDragging,
  dragPercentage,
  flipDirection,
  zIndex
}) => {
  const isLeftPage = pageNumber % 2 === 0;
  const isRightPage = !isLeftPage;

  // Calculate the rotation and shadow based on drag percentage and flip direction
  const getRotationStyle = () => {
    if (!isActive) return {};
    
    if (isFlipping) {
      const degrees = flipDirection === "forward" ? -180 : 0;
      return { transform: `rotateY(${degrees}deg)` };
    }
    
    if (isDragging) {
      // Only apply drag effect to the page being turned
      const isTargetPage = (flipDirection === "forward" && isRightPage) || 
                         (flipDirection === "backward" && isLeftPage);
      
      if (isTargetPage) {
        let rotationDegree = 0;
        
        if (flipDirection === "forward") {
          // Dragging from right to left
          rotationDegree = Math.min(dragPercentage * -180, 0);
        } else {
          // Dragging from left to right
          rotationDegree = Math.max((1 - dragPercentage) * -180, -180);
        }
        
        return {
          transform: `rotateY(${rotationDegree}deg)`,
          transformOrigin: flipDirection === "forward" ? "left" : "right"
        };
      }
    }
    
    return {};
  };

  // Determine if the page should show elevated shadow based on drag state
  const hasShadow = isDragging || isFlipping;

  return (
    <div 
      className={cn(
        "absolute top-0 w-1/2 h-full bg-white flex items-center justify-center",
        "page transition-transform duration-500 ease-out",
        isLeftPage ? "left-0 page-left" : "right-0 page-right",
        isActive ? "visible" : "invisible",
        hasShadow && "has-shadow"
      )}
      style={{
        ...getRotationStyle(),
        zIndex,
        transformOrigin: isLeftPage ? "right" : "left",
      }}
    >
      {/* Page content goes here - blank for now */}
      <div className="absolute inset-0 page-content"></div>
      
      {/* Page corners and edges for drag detection */}
      <div className="absolute top-0 right-0 w-12 h-12 corner-tl opacity-0"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 corner-br opacity-0"></div>
      <div className="absolute right-0 top-12 bottom-12 w-8 edge-right opacity-0"></div>
    </div>
  );
};

export default Page;
