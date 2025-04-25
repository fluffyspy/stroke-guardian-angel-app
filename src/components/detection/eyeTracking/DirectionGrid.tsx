
import { Eye, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";

interface DirectionGridProps {
  directions: string[];
  matchedDirections: Set<string>;
  currentDirectionIndex: number;
  testCompleted: boolean;
}

const DirectionGrid = ({
  directions,
  matchedDirections,
  currentDirectionIndex,
  testCompleted
}: DirectionGridProps) => {
  const getDirectionIcon = (direction: string) => {
    switch(direction) {
      case "Left": return <ArrowLeft />;
      case "Right": return <ArrowRight />;
      case "Up": return <ArrowUp />;
      case "Down": return <ArrowDown />;
      case "Up-Left": return (
        <div className="relative">
          <ArrowUp className="absolute -rotate-45" />
        </div>
      );
      case "Up-Right": return (
        <div className="relative">
          <ArrowUp className="absolute rotate-45" />
        </div>
      );
      case "Down-Left": return (
        <div className="relative">
          <ArrowDown className="absolute rotate-45" />
        </div>
      );
      case "Down-Right": return (
        <div className="relative">
          <ArrowDown className="absolute -rotate-45" />
        </div>
      );
      default: return <Eye />;
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {directions.map((direction, index) => (
        <div 
          key={direction}
          className={`p-2 rounded-md flex flex-col items-center transition-all duration-300 ${
            matchedDirections.has(direction) 
              ? "bg-green-100 text-green-800" 
              : index === currentDirectionIndex && !testCompleted
              ? "bg-blue-100 text-blue-800 animate-pulse"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {getDirectionIcon(direction)}
          <span className="text-xs mt-1">{direction}</span>
        </div>
      ))}
    </div>
  );
};

export default DirectionGrid;
