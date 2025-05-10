
import React from "react";
import Book from "@/components/Book";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 pt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl text-white font-light text-center mb-8 opacity-70">
        Interactive Book Experience
      </h1>
      
      <div className="flex-grow flex items-center justify-center pb-16">
        <Book totalPages={10} />
      </div>
      
      <div className="text-white/50 text-center pb-6 text-sm">
        <p>Drag page corners or edges to turn pages</p>
        <p>Use arrow keys or buttons for navigation</p>
      </div>
    </div>
  );
};

export default Index;
