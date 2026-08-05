import "./WorkspaceTitle.css";
export default function WorkspaceTitle({

    title,
    subtitle,

}) {

    return (

        <div className="workspace-title">

            <h1>{title}</h1>

            <p>{subtitle}</p>

        </div>

    );

}