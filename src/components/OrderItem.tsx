import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface OrderItemProps {
  color: string; // Define el tipo aquí
}

const getColorClass = (color: string) => {
  switch(color) {
    case 'white':
      return 'bg-white';
    case 'yellow':
      return 'bg-amber-300';
    case 'orange':
      return 'bg-orange-500';
    case 'red':
      return 'bg-red-500';
    case 'pink':
      return 'bg-rose-400';
    case 'purple':
      return 'bg-purple-500';
    case 'green':
      return 'bg-green-400';
    case 'blue':
      return 'bg-sky-400';
    case 'gray':
      return 'bg-gray-500';
    case 'brown':
      return 'bg-brown-500';
    case 'black':
      return 'bg-stone-900';
    default:
      return '';
  }
}


export const OrderItem = ({ color }: OrderItemProps) => {

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: color,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div className={`flex gap-2 items-center justify-center w-20 h-20 ${getColorClass(color)}`}></div>
    </div>
  )
}