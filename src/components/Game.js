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
const GAME_STATUS_SUBSCRIPTION = gql`
    subscription gameStatus($roomCode: String) {
        gameStatus(roomCode: $roomCode) {
            gameStatus
            id
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

class GameContainer extends React.PureComponent {
    componentDidMount() {
        console.log("this.props.subscibe", this.props.subscribe);
        this.props.subscribe();
    }
    render() {
        console.log("this", this.props);
        return <div>{this.props.children}</div>;
    }
}
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
    const subscribeToGameStatus = () =>
        roomQuery.subscribeToMore({
            document: GAME_STATUS_SUBSCRIPTION,
            variables: { roomCode: cookies.roomCode },
            updateQuery: (prev, { subscriptionData }) => {
                console.log("prev", prev, subscriptionData);
                if (!subscriptionData.data.playerJoined) return prev;
                // const newPlayer = subscriptionData.data.playerJoined;
                const updatedRoom = Object.assign({}, prev);
                updatedRoom.currentRoom.gameStatus =
                    subscriptionData.data.gameStatus.gameStatus;
                return updatedRoom;
            }
        });
    const isGame = cookies.roomCode != null;
    if (isGame) {
        let GameSpace;
        if (roomQuery?.data?.currentRoom?.gameStatus === "waiting") {
            GameSpace = (
                <div>
                    <h1 className="WouldRather">Would you rather?</h1>

                    <div className="Instructions">
                        We have a game with code{" "}
                        <div className="RoomCode">
                            {roomQuery?.data?.currentRoom?.roomCode}
                        </div>{" "}
                        and gameStatus{" "}
                        {roomQuery?.data?.currentRoom?.gameStatus}
                        <h3> Waiting for more players...</h3>
                    </div>
                </div>
            );
        } else {
            GameSpace = (
                <div>
                    We have a game in progress!
                    {roomQuery?.data?.currentRoom?.questions}
                </div>
            );
        }
        return (
            <div className="Game">
                <GameContainer subscribe={subscribeToGameStatus}>
                    {GameSpace}
                    <Players roomCode={cookies.roomCode} />
                </GameContainer>
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
