import React from "react";
import './Icon.css'

function Icon(props) {

    return (
        <div className="iconHolder">
            <img alt={props.name}
                src={props.src}
                name={props.name}
                onClick={() => props.handleClick(props.name)}
                className="bosses"
            />
        </div>
    )
};

export default Icon;
