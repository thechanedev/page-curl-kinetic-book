
import React, { useRef, useState, useEffect } from "react";
import Page from "./Page";
import { cn } from "@/lib/utils";

interface BookProps {
  totalPages: number;
  className?: string;
}

const Book: React.FC<BookProps> = ({ totalPages = 10, className }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward");
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const bookRef = useRef<HTMLDivElement>(null);

  // Create an array of page indices
  const pageIndices = Array.from({ length: totalPages }, (_, i) => i);

  // Handle the start of dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragStartX(clientX);
    setDragCurrentX(clientX);
    
    // Determine flip direction based on which side of the book was clicked
    if (bookRef.current) {
      const bookRect = bookRef.current.getBoundingClientRect();
      const bookCenterX = bookRect.left + bookRect.width / 2;
      setFlipDirection(clientX < bookCenterX ? "backward" : "forward");
    }
  };

  // Handle the dragging motion
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragCurrentX(clientX);
    
    // Calculate drag percentage to update page curl visually
    const dragDelta = clientX - dragStartX;
    const dragThreshold = 100; // Minimum drag distance to trigger page flip
    
    if (Math.abs(dragDelta) > dragThreshold && !isFlipping) {
      completeTurn();
    }
  };

  // Handle the end of dragging
  const handleDragEnd = () => {
    if (isDragging) {
      const dragDelta = dragCurrentX - dragStartX;
      const dragThreshold = 50; // Smaller threshold for completion

      if (Math.abs(dragDelta) > dragThreshold) {
        completeTurn();
      } else {
        // Reset if drag wasn't far enough
        setIsDragging(false);
      }
    }
  };

  // Complete the page turn
  const completeTurn = () => {
    setIsFlipping(true);
    setIsDragging(false);
    
    // Update current page after animation completes
    setTimeout(() => {
      if (flipDirection === "forward" && currentPage < totalPages - 2) {
        setCurrentPage(currentPage + 2);
      } else if (flipDirection === "backward" && currentPage > 0) {
        setCurrentPage(currentPage - 2);
      }
      setIsFlipping(false);
    }, 500); // Match this to the CSS animation duration
  };

  // Calculate the drag percentage to control page curl
  const calculateDragPercentage = () => {
    if (!isDragging) return 0;
    
    const dragDelta = dragCurrentX - dragStartX;
    const maxDrag = 200; // Maximum drag distance for full effect
    
    return Math.min(Math.max(dragDelta / maxDrag, -1), 1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isFlipping && currentPage < totalPages - 2) {
        setFlipDirection("forward");
        completeTurn();
      } else if (e.key === "ArrowLeft" && !isFlipping && currentPage > 0) {
        setFlipDirection("backward");
        completeTurn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isFlipping, totalPages]);

  // Add event listeners for touch and mouse across the entire document once dragging starts
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDrag(e as unknown as React.MouseEvent);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e: TouchEvent) => handleDrag(e as unknown as React.TouchEvent);
      const handleTouchEnd = () => handleDragEnd();

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, dragStartX]);

  const dragPercentage = calculateDragPercentage();

  return (
    <div 
      ref={bookRef}
      className={cn(
        "relative w-full max-w-4xl aspect-[3/2] mx-auto select-none perspective",
        className
      )}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="book-container">
        {pageIndices.map((index) => (
          <Page
            key={index}
            pageNumber={index}
            isActive={index === currentPage || index === currentPage + 1}
            isFlipping={isFlipping && 
              (flipDirection === "forward" ? index === currentPage + 1 : index === currentPage - 1)}
            isDragging={isDragging}
            dragPercentage={dragPercentage}
            flipDirection={flipDirection}
            zIndex={totalPages - Math.abs(index - currentPage)}
          />
        ))}
      </div>
      
      {/* Book navigation controls */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-50">
        <button 
          onClick={() => {
            if (!isFlipping && currentPage > 0) {
              setFlipDirection("backward");
              completeTurn();
            }
          }}
          className="bg-white/10 text-white px-4 py-2 rounded-md backdrop-blur-sm 
                     opacity-50 hover:opacity-100 transition-opacity"
          disabled={isFlipping || currentPage === 0}
        >
          Previous
        </button>
        <button 
          onClick={() => {
            if (!isFlipping && currentPage < totalPages - 2) {
              setFlipDirection("forward");
              completeTurn();
            }
          }}
          className="bg-white/10 text-white px-4 py-2 rounded-md backdrop-blur-sm 
                     opacity-50 hover:opacity-100 transition-opacity"
          disabled={isFlipping || currentPage >= totalPages - 2}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Book;
