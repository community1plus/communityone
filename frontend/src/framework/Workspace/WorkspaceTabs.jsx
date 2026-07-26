import "./WorkspaceTabs.css";

export default function WorkspaceTabs({
    items = [],
    value,
    onChange,
}) {

    return (

        <nav className="workspace-tabs">

            {items.map((item) => {

                const active = item.value === value;

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