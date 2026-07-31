import "./ProgressRing.css";
export default function ProgressRing({ model }) {

    return (

        <div className="progress-ring">

            <div className="progress-ring-circle">

                {model.percentage}%

            </div>

            <div className="progress-ring-label">

                {model.label}

            </div>

        </div>

    );

}