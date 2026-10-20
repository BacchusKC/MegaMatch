import React from "react";
import './Icon.css';

function Icon(props) {
    return (
        <button
            type="button"
            className="iconHolder"
            onClick={() => props.handleClick(props.name)}
        >
            <img alt={props.name} src={props.src} className="bosses" />
        </button>
    );
}

export default Icon;
