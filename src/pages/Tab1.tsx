import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

import React from "react";
import styled from "styled-components";
import TicTacToe from "../TicTacToe";
import "papercss/dist/paper.min.css";

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tic Tac Toe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tic Tac Toe</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Main>
           <TicTacToe />
        </Main>
      </IonContent>
    </IonPage>
  );
};

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  {/*height: 100vh;*/}
`;

export default Tab1;
