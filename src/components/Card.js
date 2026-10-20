import React from "react";
import './Card.css';

function Card(props) {
    const classes = ["card"];
    if (props.faceUp) classes.push("faceUp");
    if (props.matched) classes.push("matched");

    return (
        <button
            type="button"
            className={classes.join(" ")}
            onClick={props.onClick}
            aria-label={props.faceUp ? props.name : "Face-down card"}
        >
            <span className="cardInner">
                <span className="cardFace cardBack">
                    <img alt="" src={props.backSrc} />
                </span>
                <span className="cardFace cardFront">
                    <img alt="" src={props.src} />
                </span>
            </span>
        </button>
    );
}

export default Card;
