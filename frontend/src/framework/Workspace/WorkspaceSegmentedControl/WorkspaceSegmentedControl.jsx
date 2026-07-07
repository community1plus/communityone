import "./WorkspaceSegmentedControl.css";

export default function WorkspaceSegmentedControl({

    options = [],
    value,
    onChange,
    disabled = false,

}) {

    return (

        <div className="workspace-segmented">

            {options.map((option) => (

                <button
                    key={option.value}
                    type="button"
                    disabled={disabled}
                    className={`workspace-segment ${
                        value === option.value ? "active" : ""
                    }`}
                    onClick={() => onChange(option.value)}
                >

                    {option.label}

                </button>

            ))}

        </div>

    );

}