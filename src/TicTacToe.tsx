import React, { useState } from "react";
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

const emptyGrid = new Array(DIMENSIONS ** 2).fill(null);

export default function TicTacToe() {
  const [grid, setGrid] = useState(emptyGrid);
  const [players, setPlayers] = useState<Record<string, number | null>>({
    human: null,
    ai: null,
  });
  const [gameState, setGameState] = useState(GAME_STATES.notStarted);

  const move = (index: number, player: number | null) => {
    if (player !== null) {
      setGrid((grid) => {
        const gridCopy = grid.concat();
        gridCopy[index] = player;
        return gridCopy;
      });
    };
  };

  const aiMove = () => {
    let index = getRandomInt(0, 8);
    while (grid[index]) {
      index = getRandomInt(0, 8);
    }
    move(index, players.ai);
  };

  const humanMove = (index: number) => {
    if (!grid[index]) {
      move(index, players.human);
      aiMove();
    }
  };

  const choosePlayer = (option: number) => {
    setPlayers({ human: option, ai: switchPlayer(option) });
    setGameState(GAME_STATES.inProgress);
  };

  return gameState === GAME_STATES.notStarted ? (
    <div>
      <Inner>
        <p>Choose your player</p>
        <ButtonRow>
          {/*
            *TODO: Move to css
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
            <Square key={index} onClick={() => humanMove(index)}>
              {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
            </Square>
          );
        })}
      </Container>
    </StyleSheetManager>
  );
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
