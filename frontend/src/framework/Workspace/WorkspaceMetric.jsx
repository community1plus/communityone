import "./WorkspaceMetric.css";
import ProgressRing from "./ProgressRing";

export default function WorkspaceMetric({
    model,
}) {

    return (

        <div className="workspace-metric">

            <ProgressRing
                value={model.value}
            />

        </div>

    );

}