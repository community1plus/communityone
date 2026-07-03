import "./WorkspaceProgress.css";

export default function WorkspaceProgress({

  value = 0,
  label,

}) {

  return (

<section className="workspace-progress">

    <div className="workspace-progress-track">

        <div
            className="workspace-progress-fill"
            style={{ width: `${value}%` }}
        />

    </div>

    <span className="workspace-progress-label">

        {label}

    </span>

</section>

  );

}