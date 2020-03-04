import React from "react";
import "./Button.css";
export const Button = props => {
    return (
        <div className="Button" onClick={props.onClick}>
            <h1>{props.buttonText}</h1>
        </div>
    );
};
