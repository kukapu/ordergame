'use client'
import { OrderItem } from '@/components/OrderItem';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useState, useEffect } from 'react';

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
  const [attempts, setAttempts] = useState(10);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);
  const [history, setHistory] = useState<History[][]>([]);

  useEffect(() => {
    const randomColorList = disorderList([...completeList]);
    const lengthList = spliceList(randomColorList, 4);
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
    let playerListCopy = JSON.parse(JSON.stringify(playerList)); // Crear una copia profunda de playerList
    for (let i = 0; i < playerListCopy.length; i++) {
      if (playerListCopy[i] === solutionList[i]) {
        matchCount++;
      }
    }
    setMatches(matchCount);
    setAttempts(attempts - 1);
    setHistory([...history, [{playerListCopy, matchCount}]]);
    console.log(history);
  }

  return (
    <div className='center'>
      <h1>ORDER GAME</h1>

      {/* <div className='flex gap-2'>
        {
          solutionList.map((color) => (
            <OrderItem color={color} key={color} />
          ))
        }
      </div> */}

      {
        history.map(history => {
          return (
            <>
              <span className='flex gap-2' key={JSON.stringify(history)}>
                {
                  history[0].playerListCopy.map((color: string) => (
                    <>
                      <OrderItem color={color} key={color} />
                    </>
                  ))
                }
              </span>
              <span>{history[0].matchCount}</span> 
            </>
          )
        })
      }

      <DndContext
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
                  <OrderItem color={color} key={color}/>
              ))
            }
          </div>
        </SortableContext>

      </DndContext>
      <button onClick={checkMatches}>TEST</button>
      <p>Número de coincidencias: {matches}</p>
      <p>Número de intentos: {attempts}</p>
    </div>
  )
}