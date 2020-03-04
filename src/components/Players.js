import { useSubscription, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React, { useEffect } from "react";
import "./Players.css";
const PLAYER_SUBSCRIPTION = gql`
    subscription playerJoined($roomCode: String) {
        playerJoined(roomCode: $roomCode) {
            name
            id
        }
    }
`;
const ROOM_QUERY = gql`
    query currentRoom($roomCode: String) {
        currentRoom(roomCode: $roomCode) {
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

const playerList = (loading, data) => {
    if (loading) {
        return <div>Loading players...</div>;
    }
    if (data?.currentRoom?.players.length === 0) {
        return <div className="NoPlayers">No players have joined yet!</div>;
    }
    return (
        <div className="PlayerContainer">
            {data?.currentRoom?.players.map(p => (
                <div className="Player" key={p.id}>
                    {p.name}
                </div>
            ))}
        </div>
    );
};
class PlayerListContainer extends React.PureComponent {
    componentDidMount() {
        this.props.subscribe();
    }
    render() {
        return <div>{this.props.playerList}</div>;
    }
}

export const Players = props => {
    const { subscribeToMore, data, loading } = useQuery(ROOM_QUERY, {
        variables: { roomCode: props.roomCode }
    });
    const subscribeToNewPlayers = () =>
        subscribeToMore({
            document: PLAYER_SUBSCRIPTION,
            variables: { roomCode: props.roomCode },
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data.playerJoined) return prev;
                const newPlayer = subscriptionData.data.playerJoined;
                const updatedRoom = Object.assign({}, prev);
                updatedRoom.currentRoom.players.push(newPlayer);
                return updatedRoom;
            }
        });

    return (
        <div className="PlayersFooter">
            <PlayerListContainer
                playerList={playerList(loading, data)}
                subscribe={subscribeToNewPlayers}
            />
        </div>
    );
};
