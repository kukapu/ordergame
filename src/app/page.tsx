'use client'
import { OrderItem } from '@/components/OrderItem';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface History {
  playerListCopy: string[];
  matchCount: number;
}

const completeList: string[] = [
  'white',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'green',
  'blue',
  'gray',
  'brown',
  'black',
]

const spliceList = (list: string[], n: number): string[] => {
  return list.slice(0, n);
}

function disorderList<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}


export default function Home() {

  const [solutionList, setSolutionList] = useState<string[]>([]);
  const [playerList, setPlayerList] = useState<string[]>([]);

  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(8);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const [history, setHistory] = useState<History[][]>([]);

  useEffect(() => {
    const randomColorList = disorderList([...completeList]);
    const lengthList = spliceList(randomColorList, 5);
    setSolutionList(disorderList([...lengthList]));
    setPlayerList(disorderList([...lengthList]));
  }, []);

  function handleOnDragEnd(event: { active: any; over: any; }) {
    const { active, over } = event;
    const oldIndex = playerList.findIndex(color => color === active.id)
    const newIndex = playerList.findIndex(color => color === over.id)
    const newOrder = arrayMove(playerList, oldIndex, newIndex)
    setPlayerList(newOrder);
  }

  function checkMatches() {
    let matchCount = 0;
    if (attempts <= 0) {
      return;
    }
    let playerListCopy = JSON.parse(JSON.stringify(playerList)); // Crear una copia profunda de playerList
    for (let i = 0; i < playerListCopy.length; i++) {
      if (playerListCopy[i] === solutionList[i]) {
        matchCount++;
      }
    }
    setMatches(matchCount);
    setAttempts(attempts - 1);
    setHistory([[{playerListCopy, matchCount}],...history]);

    if (matchCount === solutionList.length) {
      setWin(true);
    }
    if (attempts >= 1) {
      setLose(true);
    }
  }

  return (
    <div className='pt-10 flex flex-col items-center h-screen'>
      <h1>ORDER GAME</h1>

      {/* <div className='flex gap-2'>
        {
          solutionList.map((color) => (
            <OrderItem color={color} key={color} />
          ))
        }
      </div> */}
      <button className='h-10 w-20 bg-stone-400' onClick={checkMatches}>TEST</button>
      <p>Número de coincidencias: {matches}</p>
      <p>Intentos restantes: {attempts}</p>
      {!win && <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleOnDragEnd}
      >
        <SortableContext
          items={playerList}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex gap-2'>
            {
              playerList.map((color) => (
                  <OrderItem color={color} key={uuidv4()}/>
              ))
            }
          </div>
        </SortableContext>

      </DndContext>}

      {
        history.map((history, index) => {
          return (
            <>
              <span className='flex gap-2 mt-2' key={uuidv4()}>
                {
                  history[0].playerListCopy.map((color: string) => (
                    <>
                      <OrderItem color={color} key={color} />
                    </>
                  ))
                }
              <span className='text-2xl flex center'>{history[0].matchCount}</span> 
              </span>
            </>
          )
        })
      }
    </div>
  )
}