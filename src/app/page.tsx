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

interface ShufflePosition {
  id: string;
  position: number;
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
  const [history, setHistory] = useState<(History | null)[]>([]);
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
    
    // Inicializar historial vacío para evitar errores en el mapeo
    setHistory(Array(7).fill(null));
    
    // Inicializar los intentos vacíos
    const emptyAttemptsArray = Array.from({ length: 7 }, (_, i) => i);
    setEmptyAttempts(emptyAttemptsArray);
    
    // Iniciar la animación de shuffle después de un breve retraso
    setTimeout(() => {
      setShuffling(true);
      
      // Ejecutar varios intercambios con tiempo suficiente para ver la animación
      let count = 0;
      const maxShuffles = 8;
      
      const performShuffle = () => {
        if (count >= maxShuffles) {
          setShuffling(false);
          return;
        }
        
        // Intercambiar dos posiciones aleatorias
        setPlayerList(prevList => {
          const newList = [...prevList];
          const i = Math.floor(Math.random() * 5);
          let j = Math.floor(Math.random() * 5);
          while (j === i) {
            j = Math.floor(Math.random() * 5);
          }
          
          [newList[i], newList[j]] = [newList[j], newList[i]];
          return newList;
        });
        
        count++;
        setTimeout(performShuffle, 50); 
      };
      
      performShuffle();
    }, 50); 
    
    return () => {
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
    if (currentAttempt >= 7 || win || lose) {
      return;
    }
    
    let matchCount = 0;
    let playerListCopy = [...playerList]; // Crear una copia del playerList actual
    
    for (let i = 0; i < playerListCopy.length; i++) {
      if (playerListCopy[i] === solutionList[i]) {
        matchCount++;
      }
    }
    
    // Actualizar el historial y estados inmediatamente
    const newHistory = [...history];
    newHistory[currentAttempt] = {playerListCopy, matchCount};
    setHistory(newHistory);
    
    const matchesWereEqual = matchCount === solutionList.length;
    const isLastAttempt = currentAttempt + 1 >= 7;
    
    // Actualizar los matches inmediatamente
    setMatches(matchCount);
    
    // Si es el último intento, actualizar intentos a 0
    if (isLastAttempt) {
      setAttempts(0);
    }
    
    // Primero actualizar el historial y mostrar la animación
    // Luego, con un retraso mayor, actualizar el estado del juego
    setTimeout(() => {
      if (matchesWereEqual) {
        setWin(true);
      } else if (isLastAttempt) {
        // Incrementar el currentAttempt para que se muestre la última línea
        setCurrentAttempt(currentAttempt + 1);
        
        // Después de un tiempo para mostrar la última línea, mostrar game over
        setTimeout(() => {
          setLose(true);
        }, 300);
      } else {
        // Avanzar al siguiente intento solo si no ha ganado o perdido
        setCurrentAttempt(currentAttempt + 1);
        setAttempts(attempts - 1);
      }
    }, 300); // Pequeño retraso para asegurar que la animación se vea
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
    
    // Iniciar la animación de shuffle después de un breve retraso
    setTimeout(() => {
      setShuffling(true);
      
      // Ejecutar varios intercambios con tiempo suficiente para ver la animación
      let count = 0;
      const maxShuffles = 100;
      
      const performShuffle = () => {
        if (count >= maxShuffles) {
          setShuffling(false);
          return;
        }
        
        // Intercambiar dos posiciones aleatorias
        setPlayerList(prevList => {
          const newList = [...prevList];
          const i = Math.floor(Math.random() * 5);
          let j = Math.floor(Math.random() * 5);
          while (j === i) {
            j = Math.floor(Math.random() * 5);
          }
          
          [newList[i], newList[j]] = [newList[j], newList[i]];
          return newList;
        });
        
        count++;
        setTimeout(performShuffle, 50); 
      };
      
      performShuffle();
    }, 50); 
    
    return () => {
      setShuffling(false);
    };
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-8 px-4">
      {/* Botón de cambio de tema */}
      <ThemeToggle />
      
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Order Game</h1>

      {/* Sección de Intentos y Tablero */} 
      <div className="w-full max-w-sm md:max-w-md mx-auto space-y-2 mb-6">
        {Array.from({ length: 7 }).map((_, index) => (
          <div 
            key={`attempt-row-${index}`} 
            className={`flex items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow min-h-[70px] ${index === currentAttempt ? 'ring-2 ring-blue-500' : ''}`}
          > 
            <div className="flex-1 flex justify-center items-center space-x-2 relative">
              {/* Tablero interactivo en la línea actual */}
              {index === currentAttempt && !win && !lose && (
                <div className="flex items-center">
                  <div className="flex space-x-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={playerList} strategy={verticalListSortingStrategy}> 
                        <div className="flex space-x-2">
                          {playerList.map((color, idx) => (
                            <motion.div
                              key={color}
                              layout
                              layoutId={color}
                              transition={{
                                type: "spring",
                                stiffness: 600, 
                                damping: 35, 
                                duration: 0.15 
                              }}
                            >
                              <OrderItem 
                                color={color} 
                                id={color} 
                                isShuffling={shuffling}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                  {/* Bolita con "-" para mantener alineación - con mayor separación */}
                  <div className="ml-8 w-12 h-12 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-bold text-lg">
                    -
                  </div>
                </div>
              )}
              
              {/* Historial de intentos pasados */}
              {index < currentAttempt && history[index] && (
                <div className="flex items-center">
                  <div className="flex space-x-1 md:space-x-2">
                    {history[index]?.playerListCopy.map((color: string, i: number) => (
                      <motion.div
                        key={`${index}-${i}-${color}`}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg shadow-md ${getColorClass(color)}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  {/* Mostrar número de coincidencias permanente con mayor separación */}
                  <div className="ml-4 md:ml-8 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
                    {history[index]?.matchCount}
                  </div>
                </div>
              )}
              
              {/* Placeholders para filas futuras */}
              {index > currentAttempt && (
                <div className="flex items-center">
                  <div className="flex space-x-1 md:space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`placeholder-${index}-${i}`} className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gray-300 dark:bg-gray-600 opacity-50"></div>
                    ))}
                  </div>
                  <div className="ml-4 md:ml-8 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 opacity-50">-</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Área de juego */}
      <div className="w-full max-w-sm md:max-w-md mx-auto">

        {/* Botones de acción */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={checkMatches}
            disabled={win || lose || shuffling}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Comprobar
          </button>
        </div>
      </div>

      {/* Mensajes de victoria/derrota */}
      {(win || lose) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-4"
        >
          <h2 className={`text-3xl font-bold ${win ? 'text-green-500' : 'text-red-500'}`}>
            {win ? 'You Win!' : 'Game Over!'}
          </h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Play Again
          </button>
        </motion.div>
      )}

      {/* Información - Solo mostrar intentos restantes */}
      <div className="flex justify-center text-center mt-4">
        <div>
          <p className="text-lg font-semibold">Attempts Left</p>
          <p className={`text-2xl font-bold ${attempts <= 2 ? 'text-red-500' : 'text-green-500'}`}>{attempts}</p>
        </div>
      </div>
    </div>
  );
}