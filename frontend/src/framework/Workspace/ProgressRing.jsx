import "./ProgressRing.css";

export default function ProgressRing({

    value = 0,

    size = 72,

    stroke = 6,

}) {

    const radius =
        (size - stroke) / 2;

    const circumference =
        2 * Math.PI * radius;

    const progress =
        Math.min(
            Math.max(value, 0),
            100
        );

    const offset =
        circumference -
        (progress / 100) * circumference;


    return (

        <div
            className="progress-ring"
            style={{
                width: size,
                height: size,
            }}
        >

            <svg
                className="progress-ring-svg"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >

                {/* BACKGROUND RING */}

                <circle

                    className="progress-ring-track"

                    cx={size / 2}
                    cy={size / 2}

                    r={radius}

                    fill="none"

                    strokeWidth={stroke}

                />


                {/* PROGRESS */}

                <circle

                    className="progress-ring-value"

                    cx={size / 2}
                    cy={size / 2}

                    r={radius}

                    fill="none"

                    strokeWidth={stroke}

                    strokeDasharray={
                        circumference
                    }

                    strokeDashoffset={
                        offset
                    }

                    strokeLinecap="round"

                />

            </svg>


            <span className="progress-ring-label">

                {progress}%

            </span>


        </div>

    );

}