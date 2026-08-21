import "./ProgressRing.css";


export default function ProgressRing({

    value = 0,

    size = 64,

    stroke = 4,

}) {

    const progress =
        Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            100
        );


    const radius =
        (size - stroke) / 2;


    const circumference =
        2 * Math.PI * radius;


    const offset =
        circumference -
        (progress / 100) *
        circumference;


    return (

        <div
            className="progress-ring"
            style={{
                width: size,
                height: size,
            }}
        >

            <svg
                className="progress-ring__svg"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >

                {/* Background track */}

                <circle

                    className="progress-ring__track"

                    cx={size / 2}
                    cy={size / 2}

                    r={radius}

                    fill="none"

                    strokeWidth={stroke}

                />


                {/* Completion */}

                <circle

                    className="progress-ring__progress"

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


            {/* Percentage */}

            <span className="progress-ring__value">

                {progress}%

            </span>

        </div>

    );

}