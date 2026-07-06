import "./WorkspaceProgress.css";

export default function WorkspaceProgress({

  value = 0,
  label,
 
}) {
  console.log("WorkspaceProgress", { value, label });
  return (

<section className="workspace-progress">

    <div className="workspace-progress-track">

<div
  className="workspace-progress-fill"
  style={{
    width: "20%",
    height: "20px",
  }}
/>

    </div>

    <span className="workspace-progress-label">

        {label}

    </span>

</section>

  );

}