import React, { useCallback, useEffect, useState } from "react";
import styled,  { StyleSheetManager } from "styled-components";
import isPropValid from '@emotion/is-prop-valid';
import {
  DIMENSIONS,
  GAME_STATES,
  PLAYER_O,
  PLAYER_X,
  SQUARE_DIMS,
} from "./constants";
import { getRandomInt, switchPlayer } from "./utils";
import Board from "./Board";

const board = new Board();
const emptyGrid = new Array(DIMENSIONS ** 2).fill(null);

export default function TicTacToe() {
  const [grid, setGrid] = useState(emptyGrid);
  const [players, setPlayers] = useState<Record<string, number | null>>({
    human: null,
    ai: null,
  });
  const [gameState, setGameState] = useState(GAME_STATES.notStarted);
  const [nextMove, setNextMove] = useState<null | number>(null);
  const [winner, setWinner] = useState<null | string>(null);

  const move = useCallback((index: number, player: number | null) => {
    if (player && gameState === GAME_STATES.inProgress) {
      setGrid((grid) => {
        const gridCopy = grid.concat();
        gridCopy[index] = player;
        return gridCopy;
      });
    }
  },
    [gameState],
  );

  const aiMove = useCallback(() => {
    let index = getRandomInt(0, 8);
    while (grid[index]) {
      index = getRandomInt(0, 8);
    }

    move(index, players.ai);
    setNextMove(players.human);
  },
    [move, grid, players]
  );

  const humanMove = (index: number) => {
    if (!grid[index] && nextMove === players.human) {
      move(index, players.human);
      setNextMove(players.ai);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (
      nextMove !== null &&
      nextMove === players.ai &&
      gameState !== GAME_STATES.over
    ) {
      // Delay AI moves to make them seem more natural
      timeout = setTimeout(() => {
        aiMove();
      }, 500);
    }
    return () => timeout && clearTimeout(timeout);
  }, [nextMove, aiMove, players.ai, gameState]);

  useEffect(() => {
    const boardWinner = board.getWinner(grid);
    const declareWinner = (winner: number) => {
      let winnerStr = "";
      switch (winner) {
        case PLAYER_X:
          winnerStr = "Player X wins!";
          break;
        case PLAYER_O:
          winnerStr = "Player O wins!";
          break;
        case DRAW:
        default:
          winnerStr = "It's a draw";
      }
      setGameState(GAME_STATES.over);
      setWinner(winnerStr);
    };

    if (boardWinner !== null && gameState !== GAME_STATES.over) {
      declareWinner(boardWinner);
    }
  }, [gameState, grid, nextMove]);

  const choosePlayer = (option: number) => {
    setPlayers({ human: option, ai: switchPlayer(option) });
    setGameState(GAME_STATES.inProgress);
    // Set the Player X to make the first move
    setNextMove(PLAYER_X);
  };

  const startNewGame = () => {
    setGameState(GAME_STATES.notStarted);
    setGrid(emptyGrid);
  };

  switch (gameState) {
    case GAME_STATES.notStarted:
    default:
      return (
        <div>
          <Inner>
            <p>Choose your player</p>
            <ButtonRow>
              <button style={{color: 'white', background: 'black'}} onClick={() => choosePlayer(PLAYER_X)}>X</button>
              or
              <button style={{color: 'white', background: 'black'}} onClick={() => choosePlayer(PLAYER_O)}>O</button>
            </ButtonRow>
          </Inner>
        </div>
      );
    case GAME_STATES.inProgress:
      return (
        <StyleSheetManager shouldForwardProp={shouldForwardProp}>
          <Container dims={DIMENSIONS}>
            {grid.map((value, index) => {
              const isActive = value !== null;

              return (
                <Square key={index} onClick={() => humanMove(index)}>
                  {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
                </Square>
              );
            })}
          </Container>
        </StyleSheetManager>
      );
    case GAME_STATES.over:
      return (
        <div>
          <p>{winner}</p>
          <button style={{color: 'white', background: 'black'}} onClick={startNewGame}>Start over</button>
        </div>
      );
  }
};

const ButtonRow = styled.div`
  display: flex;
  width: 150px;
  justify-content: space-between;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Container = styled.div<{ dims: number }>`
  display: flex;
  justify-content: center;
  width: ${({ dims }) => `${dims * (SQUARE_DIMS + 5)}px`};
  flex-flow: wrap;
  position: relative;
`;

const Square = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${SQUARE_DIMS}px;
  height: ${SQUARE_DIMS}px;
  border: 1px solid white;

  &:hover {
    cursor: pointer;
  }
`;

const Marker = styled.p`
  font-size: 68px;
`;

// This implements the default behavior from styled-components v5
function shouldForwardProp(propName, target) {
    if (typeof target === "string") {
        // For HTML elements, forward the prop if it is a valid HTML attribute
        return isPropValid(propName);
    }
    // For other elements, forward all props
    return true;
};
