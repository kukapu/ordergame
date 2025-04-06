'use client'
import { OrderItem } from '@/components/OrderItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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
  const [showingAttempt, setShowingAttempt] = useState<number | null>(null);

  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(7);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const [history, setHistory] = useState<History[][]>([]);
  const [emptyAttempts, setEmptyAttempts] = useState<number[]>([]);

  // Configuración de sensores para mejorar la experiencia táctil
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
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
    
    // Mostrar animación del nuevo intento
    setShowingAttempt(currentAttempt);
    
    setMatches(matchCount);
    setCurrentAttempt(currentAttempt + 1);
    setAttempts(attempts - 1);

    if (matchCount === solutionList.length) {
      setWin(true);
    }
    if (currentAttempt === 6) {
      setLose(true);
    }
    
    // Ocultar la animación después de un tiempo
    setTimeout(() => {
      setShowingAttempt(null);
    }, 1500);
  }

  return (
    <div className='pt-10 flex flex-col items-center min-h-screen'>
      <ThemeToggle />
      
      <div className="game-container">
        <h1 className="game-title">ORDER GAME</h1>

        <button className='game-button mx-auto block mb-4' onClick={checkMatches}>TEST</button>
        
        <div className="text-center mb-6">
          <p className="text-lg mb-1">Coincidencias: {matches}</p>
          <p className="text-lg">Intentos restantes: {attempts}</p>
        </div>
        
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
            <div className='flex gap-2 justify-center mb-8'>
              <AnimatePresence>
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
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
        }

        {win && (
          <motion.div 
            className="text-center p-4 rounded-lg bg-green-500/20 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">¡Has ganado!</h2>
            <p>Has ordenado correctamente todos los colores.</p>
          </motion.div>
        )}

        {lose && (
          <motion.div 
            className="text-center p-4 rounded-lg bg-red-500/20 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-2">¡Has perdido!</h2>
            <p>No has conseguido ordenar los colores correctamente.</p>
          </motion.div>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Historial de intentos:</h2>
          
          {/* Intentos completados */}
          {history.map((historyItem, index) => {
            if (!historyItem || historyItem.length === 0) return null;
            const isCurrentlyShowing = showingAttempt === index;
            
            return (
              <div className='history-item flex items-center mb-2' key={`history-${index}`}>
                <div className='flex gap-2'>
                  {
                    historyItem[0].playerListCopy.map((color: string, colorIndex: number) => (
                      <motion.div 
                        key={uuidv4()}
                        initial={isCurrentlyShowing ? { scale: 0, opacity: 0 } : false}
                        animate={isCurrentlyShowing ? { 
                          scale: 1, 
                          opacity: 1
                        } : {}}
                        transition={{ 
                          duration: 0.3, 
                          delay: isCurrentlyShowing ? colorIndex * 0.1 : 0,
                          type: "spring"
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
                    damping: 10,
                    delay: isCurrentlyShowing ? 0.6 : 0 
                  }}
                >
                  {historyItem[0].matchCount}
                </motion.div>
              </div>
            )
          })}
          
          {/* Intentos vacíos */}
          {emptyAttempts.map((attempt) => (
            <div className='history-item flex items-center mb-2 opacity-50' key={`empty-${attempt}`}>
              <div className='flex gap-2'>
                {Array.from({ length: 5 }, (_, i) => (
                  <div 
                    key={`empty-box-${attempt}-${i}`} 
                    className="color-box bg-gray-400/20"
                  ></div>
                ))}
              </div>
              <div className="match-count">?</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}