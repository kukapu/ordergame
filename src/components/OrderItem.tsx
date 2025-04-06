import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

interface OrderItemProps {
  color: string;
}

const getColorClass = (color: string) => {
  switch(color) {
    case 'gradient-1':
      return 'bg-gradient-to-r from-violet-600 to-purple-600';
    case 'gradient-2':
      return 'bg-gradient-to-r from-cyan-500 to-blue-600';
    case 'gradient-3':
      return 'bg-gradient-to-r from-emerald-500 to-green-600';
    case 'gradient-4':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500';
    case 'gradient-5':
      return 'bg-gradient-to-r from-rose-500 to-pink-500';
    case 'gradient-6':
      return 'bg-gradient-to-r from-red-500 to-orange-500';
    case 'gradient-7':
      return 'bg-gradient-to-r from-teal-400 to-teal-600';
    case 'gradient-8':
      return 'bg-gradient-to-br from-slate-700 to-slate-900';
    default:
      return 'bg-gray-500';
  }
}

export const OrderItem = ({ color }: OrderItemProps) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: color,
    transition: {
      duration: 350,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation"
    >
      <motion.div 
        className={`color-box ${getColorClass(color)}`}
        whileHover={{ scale: 1.05, rotate: 0 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isDragging ? 1.1 : 1,
          rotate: isDragging ? [-2, 2, -2] : 0,
          boxShadow: isDragging 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        }}
        transition={{
          rotate: {
            repeat: isDragging ? Infinity : 0,
            duration: 0.5
          }
        }}
      />
    </div>
  )
}