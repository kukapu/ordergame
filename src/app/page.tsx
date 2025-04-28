'use client'
import { OrderItem } from '@/components/OrderItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [solution, setSolution] = useState<string[]>([]);
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
  const [showSolution, setShowSolution] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'win' | 'lose' | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Configuración de sensores para mejorar la experiencia táctil
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const randomColorList = disorderList(disorderList([...completeList]));
    const lengthList = spliceList(randomColorList, 5);
    setSolution(disorderList([...lengthList]));
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
    
    setShowSolution(false);
    setShowModal(false);
    setModalType(null);
    
    return () => {
      setShuffling(false);
    };
  }, []);

  useEffect(() => {
    if (win) {
      setShowModal(true);
      setModalType('win');
    } else if (lose) {
      setShowModal(true);
      setModalType('lose');
    }
  }, [win, lose]);

  // Manejar reabrir el modal al hacer clic solo en la zona de juego si la partida terminó
  useEffect(() => {
    function handleGameAreaClick(e: MouseEvent) {
      if (!showModal && (win || lose)) {
        setShowModal(true);
      }
    }
    const gameArea = gameAreaRef.current;
    if (gameArea && !showModal && (win || lose)) {
      gameArea.addEventListener('click', handleGameAreaClick);
    }
    return () => {
      if (gameArea) gameArea.removeEventListener('click', handleGameAreaClick);
    };
  }, [showModal, win, lose]);

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
    if (win || lose || shuffling) return;
    
    let matchCount = 0;
    let playerListCopy = [...playerList]; // Crear una copia del playerList actual
    
    for (let i = 0; i < playerListCopy.length; i++) {
      if (playerListCopy[i] === solution[i]) {
        matchCount++;
      }
    }
    
    // Actualizar historial inmediatamente
    const newHistory = [...history];
    newHistory[currentAttempt] = {playerListCopy, matchCount};
    
    const matchesWereEqual = matchCount === solution.length;
    const isLastAttempt = currentAttempt + 1 >= 7;
    
    // Actualizar todo el estado de una vez para evitar retrasos
    setMatches(matchCount);
    setHistory(newHistory);
    
    // Actualizamos todo inmediatamente sin setTimeout
    if (matchesWereEqual) {
      setCurrentAttempt(prev => prev + 1);
      setAttempts(prev => prev - 1);
      setWin(true);
    } else if (isLastAttempt) {
      setCurrentAttempt(prev => prev + 1);
      setAttempts(prev => prev - 1);
      setLose(true);
    } else {
      setCurrentAttempt(prev => prev + 1);
      setAttempts(prev => prev - 1);
    }
  }

  function resetGame() {
    const randomColorList = disorderList(disorderList([...completeList]));
    const lengthList = spliceList(randomColorList, 5);
    setSolution(disorderList([...lengthList]));
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
    
    // Reiniciar animación con tiempo reducido
    setShuffling(true);
    
    // Reducir el tiempo de espera inicial
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
        setTimeout(performShuffle, 50); // Mantener en 50ms para fluidez
      };
      
      performShuffle();
    }, 50); // Reducido para mejor rendimiento
  }

  return (
    <div ref={gameAreaRef} className="flex flex-col items-center justify-start min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-4 px-3 sm:pt-8 sm:px-4">
      {/* Espacio superior para no invadir el NavBar */}
      <div className="h-16 sm:h-20" />
      {/* Checkbox para mostrar la solución */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center mb-4">
        <label className="flex items-center gap-3 cursor-pointer select-none text-base font-medium text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={!!showSolution}
            onChange={e => setShowSolution(e.target.checked)}
            className="appearance-none w-6 h-6 border-2 border-indigo-400 dark:border-indigo-500 rounded-md bg-white dark:bg-slate-800 checked:bg-indigo-500 checked:dark:bg-indigo-600 checked:border-transparent transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <span className="ml-1">Enseñar solución</span>
        </label>
      </div>
      {/* Sección de depuración - Solución (oculta por defecto) */}
      {showSolution && (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium mb-1 text-center">Solución (Debug):</p>
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {solution.map((color, idx) => (
              <div
                key={`debug-solution-${idx}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${getColorClass(color)}`}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sección de Intentos y Tablero */} 
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto space-y-1.5 sm:space-y-2 mb-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div 
            key={`attempt-row-${index}`} 
            className={`flex items-center justify-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow min-h-[60px] sm:min-h-[70px] ${index === currentAttempt && !win ? 'ring-2 ring-blue-500' : ''} ${win && index === currentAttempt - 1 ? 'ring-2 ring-green-500' : ''}`}
          > 
            <div className="flex-1 flex justify-center items-center space-x-2 relative">
              {/* Tablero interactivo en la línea actual */}
              {index === currentAttempt && !win && !lose && (
                <div className="flex items-center">
                  <div className="flex space-x-1.5 sm:space-x-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={playerList} strategy={verticalListSortingStrategy}> 
                        <div className="flex space-x-1.5 sm:space-x-2">
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
                  {/* Círculo de coincidencias */}
                  <div className="ml-4 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-base sm:text-lg">
                    {"?"}
                  </div>
                </div>
              )}
              
              {/* Historial de intentos pasados */}
              {index < currentAttempt && history[index] && (
                <div className="flex items-center">
                  <div className="flex space-x-1.5 sm:space-x-2">
                    {history[index]?.playerListCopy.map((color: string, i: number) => (
                      <motion.div
                        key={`${index}-${i}-${color}`}
                        className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg shadow-md ${getColorClass(color)}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  {/* Mostrar número de coincidencias permanente con mayor separación */}
                  <div className={`ml-4 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-white font-bold text-base sm:text-lg ${history[index]?.matchCount === 5 ? 'bg-green-500' : 'bg-blue-500'}`}>
                    {history[index]?.matchCount}
                  </div>
                </div>
              )}
              
              {/* Placeholders para filas futuras */}
              {(index > currentAttempt || (win && index >= currentAttempt)) && (
                <div className="flex items-center">
                  <div className="flex space-x-1.5 sm:space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`placeholder-${index}-${i}`} className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gray-300 dark:bg-gray-600 opacity-50"></div>
                    ))}
                  </div>
                  <div className="ml-4 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 opacity-50">-</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Área de juego */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto flex justify-center">
        
        {/* Botones de acción */}
        <div className="mt-4 flex justify-center relative">
          <button
            onClick={checkMatches}
            disabled={win || lose || shuffling}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium relative"
          >
            Comprobar
            
            {/* Contador de intentos pegado a la esquina del botón */}
            <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border border-white dark:border-gray-800 transform translate-x-1/4 -translate-y-1/4 ${attempts <= 2 ? 'bg-red-500' : 'bg-green-500'}`}>
              {attempts}
            </div>
          </button>
        </div>
      </div>

      {/* Modal de victoria o derrota */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-2 relative flex flex-col items-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
              aria-label="Cerrar modal"
            >
              ×
            </button>
            {modalType === 'win' && (
              <>
                <p className="text-lg font-bold mb-2 text-green-700 dark:text-green-300">¡Felicidades!</p>
                <p className="mb-1">Has ganado en {currentAttempt} intentos.</p>
                <p className="mt-2">Solución correcta:</p>
                <div className="flex justify-center space-x-1 sm:space-x-2 my-3">
                  {solution.map((color, idx) => (
                    <div
                      key={`solution-${idx}`}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getColorClass(color)}`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => { setShowModal(false); resetGame(); setModalType(null); }}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md text-sm"
                >
                  Jugar de nuevo
                </button>
              </>
            )}
            {modalType === 'lose' && (
              <>
                <p className="text-lg font-bold mb-2 text-red-700 dark:text-red-300">¡Has perdido!</p>
                <p>La solución era:</p>
                <div className="flex justify-center space-x-1 sm:space-x-2 my-3">
                  {solution.map((color, idx) => (
                    <div
                      key={`solution-${idx}`}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${getColorClass(color)}`}
                    ></div>
                  ))}
                </div>
                <button
                  onClick={() => { setShowModal(false); resetGame(); setModalType(null); }}
                  className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md text-sm"
                >
                  Intentar de nuevo
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}