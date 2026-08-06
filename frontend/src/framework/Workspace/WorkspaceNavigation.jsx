import "./WorkspaceNavigation.css";

export default function WorkspaceNavigation({

    model = {},

}) {

    const {

        items = [],

        current,

        onChange,

    } = model;

    return (

        <nav className="workspace-tabs">

            {items.map((item) => {

                const active = item.value === current;

                return (

                    <button
                        key={item.value}
                        type="button"
                        className={`workspace-tab ${active ? "active" : ""}`}
                        onClick={() => onChange?.(item.value)}
                    >

                        {item.label}

                    </button>

                );

            })}

        </nav>

    );

}