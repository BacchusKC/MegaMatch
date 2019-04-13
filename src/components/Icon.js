import React from "react";
import './icon.css'

function Icon(props) {

    return (
        <div className="iconHolder">
            <img alt={props.name}
                src={props.src}
                name={props.name}
                onClick={() => props.handleClick(props.name)}
            />
        </div>

    )
};

export default Icon;
