import React from "react";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { InMemoryCache } from "apollo-cache-inmemory";
import { split } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import ws from "ws";
import fetch from "cross-fetch";
import logo from "./logo.svg";
import "./App.css";
const httpLink = createHttpLink({
    uri: "http://localhost:4000",
    fetch
});

const wsLink = new WebSocketLink({
    uri: "ws://localhost:4000/graphql",
    options: {
        reconnect: true
    },
    webSocketImpl: ws
});
const splitFunc = ({ query }) => {
    const definition = getMainDefinition(query);
    console.log("splitFunc query", query);
    console.log("splitFunc def", definition);
    return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
    );
};
const client = new ApolloClient({
    link: split(splitFunc, wsLink, httpLink),
    cache: new InMemoryCache()
});

function App() {
    return (
        <ApolloProvider client={client}>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <a
                        className="App-link"
                        href="https://reactjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn React
                    </a>
                </header>
            </div>
        </ApolloProvider>
    );
}

export default App;
