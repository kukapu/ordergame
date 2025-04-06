'use client'
import { OrderItem } from '@/components/OrderItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

interface History {
  playerListCopy: string[];
  matchCount: number;
}

// Lista de colores con gradientes actualizados
const completeList: string[] = [
  'gradient-1',
  'gradient-2',
  'gradient-3',
  'gradient-4',
  'gradient-5',
  'gradient-6',
  'gradient-7',
  'gradient-8',
]

const spliceList = (list: string[], n: number): string[] => {
  return list.slice(0, n);
}

function disorderList<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Función para obtener la clase de color para el historial
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

export default function Home() {
  const [solutionList, setSolutionList] = useState<string[]>([]);
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [shuffling, setShuffling] = useState(true);
  const [activeShuffleIndex, setActiveShuffleIndex] = useState<number | null>(null);
  const [showingAttempts, setShowingAttempts] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(7);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [emptyAttempts, setEmptyAttempts] = useState<number[]>([]);

  // Configuración de sensores para mejorar la experiencia táctil
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const randomColorList = disorderList(disorderList([...completeList]));
    const lengthList = spliceList(randomColorList, 5);
    setSolutionList(disorderList([...lengthList]));
    setPlayerList(disorderList([...lengthList]));
    
    // Inicializar los intentos vacíos
    const emptyAttemptsArray = Array.from({ length: 7 }, (_, i) => i);
    setEmptyAttempts(emptyAttemptsArray);
    
    // Animación de mezcla inicial estilo trilero
    const startShuffleAnimation = () => {
      let shuffleCount = 0;
      const maxShuffles = 8; // Reducido de 15 a 8 movimientos
      
      const shuffleStep = () => {
        if (shuffleCount >= maxShuffles) {
          setActiveShuffleIndex(null);
          setShuffling(false);
          return;
        }
        
        // Seleccionar dos índices aleatorios para intercambiar
        const i = Math.floor(Math.random() * 5);
        let j = Math.floor(Math.random() * 5);
        while (j === i) {
          j = Math.floor(Math.random() * 5);
        }
        
        // Mostrar cuál está activo (para la animación)
        setActiveShuffleIndex(i);
        
        // Intercambiar las posiciones
        setTimeout(() => {
          setPlayerList(prevList => {
            const newList = [...prevList];
            [newList[i], newList[j]] = [newList[j], newList[i]];
            return newList;
          });
          
          // Siguiente paso
          shuffleCount++;
          setTimeout(shuffleStep, 60); // Reducido de 120ms a 60ms
        }, 40); // Reducido de 80ms a 40ms
      };
      
      // Comenzar la animación después de un breve retraso
      setTimeout(shuffleStep, 300); // Reducido de 500ms a 300ms
    };
    
    startShuffleAnimation();
    
    // Cleanup
    return () => {
      setActiveShuffleIndex(null);
      setShuffling(false);
    };
  }, []);

  function handleDragEnd(event: { active: any; over: any; }) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = playerList.findIndex(color => color === active.id);
      const newIndex = playerList.findIndex(color => color === over.id);
      const newOrder = arrayMove(playerList, oldIndex, newIndex);
      setPlayerList(newOrder);
    }
  }

  function checkMatches() {
    if (currentAttempt >= 7 || win) {
      return;
    }
    
    let matchCount = 0;
    let playerListCopy = JSON.parse(JSON.stringify(playerList)); // Crear una copia profunda de playerList
    
    for (let i = 0; i < playerListCopy.length; i++) {
      if (playerListCopy[i] === solutionList[i]) {
        matchCount++;
      }
    }
    
    // Actualizar el historial
    const newHistory = [...history];
    newHistory[currentAttempt] = [{playerListCopy, matchCount}];
    setHistory(newHistory);
    
    // Actualizar intentos vacíos
    const newEmptyAttempts = emptyAttempts.filter(attempt => attempt !== currentAttempt);
    setEmptyAttempts(newEmptyAttempts);
    
    // Añadir el nuevo intento al array de animaciones en curso
    setShowingAttempts(prev => [...prev, currentAttempt]);
    
    // Actualizar el estado después de la animación
    const matchesWereEqual = matchCount === solutionList.length;
    const attemptNumber = currentAttempt; // Guardar el valor actual para el timeout
    
    // Usar un timeout para asegurar que los estados se actualicen después de la animación
    setTimeout(() => {
      setMatches(matchCount);
      setCurrentAttempt(currentAttempt + 1);
      setAttempts(attempts - 1);
      
      if (matchesWereEqual) {
        setWin(true);
      }
      if (currentAttempt === 6) {
        setLose(true);
      }
    }, 100); // Tiempo muy corto para no retrasar la UI pero permitir que React actualice el DOM
    
    // Ocultar la animación después de un tiempo, pero solo eliminar el intento específico
    setTimeout(() => {
      setShowingAttempts(prev => prev.filter(attempt => attempt !== attemptNumber));
    }, 1000);
  }

  function resetGame() {
    const randomColorList = disorderList(disorderList([...completeList]));
    const lengthList = spliceList(randomColorList, 5);
    setSolutionList(disorderList([...lengthList]));
    setPlayerList(disorderList([...lengthList]));
    
    setMatches(0);
    setAttempts(7);
    setCurrentAttempt(0);
    setWin(false);
    setLose(false);
    setHistory([]);
    
    // Inicializar los intentos vacíos
    const emptyAttemptsArray = Array.from({ length: 7 }, (_, i) => i);
    setEmptyAttempts(emptyAttemptsArray);
    
    // Reiniciar animación
    setShuffling(true);
    
    // Animación de mezcla inicial
    const startShuffleAnimation = () => {
      let shuffleCount = 0;
      const maxShuffles = 8;
      
      const shuffleStep = () => {
        if (shuffleCount >= maxShuffles) {
          setActiveShuffleIndex(null);
          setShuffling(false);
          return;
        }
        
        const i = Math.floor(Math.random() * 5);
        let j = Math.floor(Math.random() * 5);
        while (j === i) {
          j = Math.floor(Math.random() * 5);
        }
        
        setActiveShuffleIndex(i);
        
        setTimeout(() => {
          setPlayerList(prevList => {
            const newList = [...prevList];
            [newList[i], newList[j]] = [newList[j], newList[i]];
            return newList;
          });
          
          shuffleCount++;
          setTimeout(shuffleStep, 60);
        }, 40);
      };
      
      setTimeout(shuffleStep, 300);
    };
    
    startShuffleAnimation();
  }

  return (
    <div className='pt-6 md:pt-10 flex flex-col items-center min-h-screen px-4'>
      <ThemeToggle />
      
      <div className="game-container w-[500px] max-w-md mx-auto">
        <h1 className="game-title">ORDER GAME</h1>
        
        {/* Panel de estadísticas */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">{matches}</span>
            <span className="stat-label">Coincidencias</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{attempts}</span>
            <span className="stat-label">Intentos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentAttempt}</span>
            <span className="stat-label">Ronda</span>
          </div>
        </div>

        {win && (
          <motion.div 
            className="win-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">¡Has ganado!</h2>
            <p className="mb-4">Has ordenado correctamente todos los colores.</p>
            <button 
              className="game-button mx-auto block" 
              onClick={resetGame}
            >
              Jugar de nuevo
            </button>
          </motion.div>
        )}

        {lose && (
          <motion.div 
            className="lose-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">¡Has perdido!</h2>
            <p className="mb-4">No has conseguido ordenar los colores correctamente.</p>
            <button 
              className="game-button mx-auto block" 
              onClick={resetGame}
            >
              Intentar de nuevo
            </button>
          </motion.div>
        )}
        
        {!win && !lose && (
          <button 
            className='game-button mx-auto block mb-8' 
            onClick={checkMatches}
          >
            Comprobar orden
          </button>
        )}
        
        {!win && 
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={playerList}
            strategy={verticalListSortingStrategy}
          >
            <div className='grid grid-cols-5 gap-2.5 mb-6 mx-auto'>
              {playerList.map((color, index) => (
                <motion.div
                  key={color}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: activeShuffleIndex === index ? 1.1 : 1, 
                    opacity: 1,
                    y: activeShuffleIndex === index ? -10 : 0
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20
                  }}
                >
                  <OrderItem color={color} />
                </motion.div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        }

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 px-2">Historial de intentos:</h2>
          
          <div className="history-container space-y-1">
            {/* Intentos completados */}
            {history.map((historyItem, index) => {
              if (!historyItem || historyItem.length === 0) return null;
              const isCurrentlyShowing = showingAttempts.includes(index);
              
              return (
                <div className='history-item flex items-center' key={`history-${index}`}>
                  <div className='grid grid-cols-5 gap-2.5 flex-grow'>
                    {
                      historyItem[0].playerListCopy.map((color: string, colorIndex: number) => (
                        <motion.div 
                          key={`${index}-${colorIndex}`}
                          initial={isCurrentlyShowing ? { scale: 0, opacity: 0 } : false}
                          animate={isCurrentlyShowing ? { 
                            scale: 1, 
                            opacity: 1
                          } : {}}
                          transition={{ 
                            duration: 0.15, 
                            delay: isCurrentlyShowing ? colorIndex * 0.07 : 0,
                            type: "spring",
                            stiffness: 400,
                            damping: 20
                          }}
                        >
                          <div className={`color-box ${getColorClass(color)}`}></div>
                        </motion.div>
                      ))
                    }
                  </div>
                  <motion.div 
                    className="match-count"
                    initial={isCurrentlyShowing ? { scale: 0 } : false}
                    animate={isCurrentlyShowing ? { scale: 1 } : {}}
                    transition={{ 
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: isCurrentlyShowing ? 0.45 : 0
                    }}
                  >
                    {historyItem[0].matchCount}
                  </motion.div>
                </div>
              );
            })}
            
            {/* Intentos vacíos */}
            {emptyAttempts.map((attempt) => (
              <div className='history-item flex items-center opacity-50' key={`empty-${attempt}`}>
                <div className='grid grid-cols-5 gap-2.5 flex-grow'>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div 
                      key={`empty-box-${attempt}-${i}`} 
                      className="color-box bg-gray-300 dark:bg-gray-700"
                    ></div>
                  ))}
                </div>
                <div className="match-count">-</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}