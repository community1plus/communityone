import "./ProgressRing.css";

export default function ProgressRing({

    value = 0,

    size = 72,

    stroke = 6,

}) {

    return (

        <div
            className="progress-ring"
            style={{
                width: size,
                height: size,
            }}
        >

            {value}%

        </div>

    );

}