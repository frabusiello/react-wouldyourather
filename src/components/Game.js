import React from "react";

import { useMutation, useQuery, useSubscription } from "@apollo/react-hooks";

import gql from "graphql-tag";
import { Button } from "./Button";
import { Players } from "./Players";
import { useCookies } from "react-cookie";
import "./Game.css";
const START_GAME = gql`
    mutation {
        createRoom {
            roomCode
            gameStatus
        }
    }
`;

const getRoomQuery = roomCode => {
    if (roomCode != null) {
        return gql`
            {
                currentRoom (roomCode:"${roomCode}") {
                    id
                    roomCode
                    gameStatus
                    players {
                        name
                        id
                    }
                }
            }
        `;
    }
    return gql`
        {
            currentRoom(roomCode: "") {
                id
                roomCode
                gameStatus
            }
        }
    `;
};
// const goToGameRoute = roomCode => {
//     Router.push(`/game/${roomCode}`);
// };
export const Game = props => {
    const [cookies, setCookie] = useCookies(["roomCode"]);

    const [startGameMutation, { data }] = useMutation(START_GAME, {
        onCompleted: result => {
            setCookie("roomCode", result.createRoom.roomCode, { path: "/" });

            // goToGameRoute(result.createRoom.roomCode);
        }
    });
    const QUERY = getRoomQuery(cookies.roomCode);
    const roomQuery = useQuery(QUERY);

    const isGame = cookies.roomCode != null;
    if (isGame) {
        return (
            <div className="Game">
                <h1 className="WouldRather">Would you rather?</h1>

                <div className="Instructions">
                    We have a game with code{" "}
                    <div className="RoomCode">
                        {roomQuery?.data?.currentRoom?.roomCode}
                    </div>{" "}
                    and gameStatus {roomQuery?.data?.currentRoom?.gameStatus}
                    <h3> Waiting for more players...</h3>
                </div>

                <Players roomCode={cookies.roomCode} />
            </div>
        );
    }
    return (
        <div className="Game">
            <h1 className="WouldRather">Would you rather?</h1>
            <Button buttonText="Start Game" onClick={startGameMutation} />
            <Button buttonText="Join Game" />
        </div>
    );
};
