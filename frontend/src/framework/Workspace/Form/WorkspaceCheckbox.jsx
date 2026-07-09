import "./WorkspaceCheckbox.css";

export default function WorkspaceCheckbox({

    checked,
    onChange,
    label,

}) {

    return (

        <button
            type="button"
            className={`workspace-checkbox ${
                checked ? "checked" : ""
            }`}
            onClick={() => onChange(!checked)}
        >

            <span className="workspace-checkbox-box">

                {checked && "✓"}

            </span>

            <span>

                {label}

            </span>

        </button>

    );

}