import React, { useCallback, useEffect, useState } from "react";
import styled,  { StyleSheetManager } from "styled-components";
import isPropValid from '@emotion/is-prop-valid';
import {
  DIMENSIONS,
  DRAW,
  GAME_MODES,
  GAME_STATES,
  PLAYER_O,
  PLAYER_X,
  SQUARE_DIMS,
} from "./constants";
import { getRandomInt, switchPlayer } from "./utils";
import Board from "./Board";
import { minimax } from "./minimax";
import { ResultModal } from "./ResultModal";
import { border } from "./styles"

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
  const [mode, setMode] = useState(GAME_MODES.medium);
  const [modalOpen, setModalOpen] = useState(false);

  const move = useCallback((index: number, player: number | null) => {
    if (player && gameState === GAME_STATES.inProgress) {
      setGrid((grid) => {
        const gridCopy = grid.concat();
        gridCopy[index] = player;
        return gridCopy;
      });
    }
  }, [gameState]);

  const humanMove = (index: number) => {
    if (!grid[index] && nextMove === players.human) {
      move(index, players.human);
      setNextMove(players.ai);
    }
  };

  const aiMove = useCallback(() => {
    // Important to pass a copy of the grid here
    const board = new Board(grid.concat());
    const emptyIndices = board.getEmptySquares(grid);
    let index;
    switch (mode) {
      case GAME_MODES.easy:
        do {
          index = getRandomInt(0, 8);
        } while (!emptyIndices.includes(index));
        break;
      // Medium level is approx. half of the moves are Minimax and the other half random
      case GAME_MODES.medium:
        const smartMove = !board.isEmpty(grid) && Math.random() < 0.5;
        if (smartMove) {
          index = minimax(board, players.ai!)[1];
        } else {
          do {
            index = getRandomInt(0, 8);
          } while (!emptyIndices.includes(index));
        }
        break;
      case GAME_MODES.difficult:
      default:
        index = board.isEmpty(grid)
          ? getRandomInt(0, 8)
          : minimax(board, players.ai!)[1];
    }

    if (index && !grid[index]) {
      if (players.ai !== null) {
        move(index, players.ai);
      }
      setNextMove(players.human);
    }
  }, [move, grid, players, mode]);

  const changeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value);
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
      let winnerStr;
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
      // Slight delay for the modal so there is some time to see the last move
      setTimeout(() => setModalOpen(true), 300);
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
    setModalOpen(false); // Close the modal when the new game starts
  };

  return gameState === GAME_STATES.notStarted ? (
    <div>
      <Inner>
        <p>Select difficulty</p>
        <select onChange={changeMode} value={mode}>
          {Object.keys(GAME_MODES).map((key) => {
            const gameMode = GAME_MODES[key];
            return (
              <option style={{color: 'white', background: 'black'}} key={gameMode} value={gameMode}>
                {key}
              </option>
            );
          })}
        </select>
      </Inner>
      <Inner>
        <p>Choose your player</p>
        <ButtonRow>
          {/*
            *TODO: Replace white with greys? #41403e and move to styles.ts
            */}
          <button style={{color: 'white', background: 'black'}} onClick={() => choosePlayer(PLAYER_X)}>X</button>
          or
          <button style={{color: 'white', background: 'black'}} onClick={() => choosePlayer(PLAYER_O)}>O</button>
        </ButtonRow>
      </Inner>
    </div>
  ) : (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <Container dims={DIMENSIONS}>
        {grid.map((value, index) => {
          const isActive = value !== null;

          return (
            <Square
              data-testid={`square_${index}`}
              key={index}
              onClick={() => humanMove(index)}
            >
              {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
            </Square>
          );
        })}
        <Strikethrough
          styles={
            gameState === GAME_STATES.over ? board.getStrikethroughStyles() : ""
          }
        />
        <ResultModal
          isOpen={modalOpen}
          winner={winner}
          close={() => setModalOpen(false)}
          startNewGame={startNewGame}
        />
      </Container>
    </StyleSheetManager>
  );
};

const Strikethrough = styled.div<{ styles: string | null }>`
  position: absolute;
  ${({ styles }) => styles}
  background-color: indianred;
  height: 5px;
  width: ${({ styles }) => !styles && "0px"};
`;

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
  ${border}; // Adding new border styles

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
