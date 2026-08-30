import "./ProgressRing.css";

export default function ProgressRing({

    value = 0,

    size = 72,

    stroke = 6,

}) {

    const percentage =
        Math.max(
            0,
            Math.min(
                100,
                Number(value) || 0
            )
        );

    const radius =
        (size - stroke) / 2;

    const circumference =
        2 * Math.PI * radius;

    const offset =
        circumference -
        (percentage / 100) *
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
                className="progress-ring-svg"
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
            >

                {/* Background ring */}

                <circle
                    className="progress-ring-track"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    fill="none"
                />

                {/* Progress */}

                <circle
                    className="progress-ring-progress"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />

            </svg>


            <span className="progress-ring-value">

                {percentage}%

            </span>

        </div>

    );

}