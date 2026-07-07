import "./WorkspaceTabs.css";

export default function WorkspaceTabs({

    tabs = [],
    current = 0,
    onChange,

}) {

    return (

        <nav className="workspace-tabs">

            {tabs.map((tab, index) => (

                <button
                    key={tab.id}
                    type="button"
                    className={`workspace-tab ${index === current ? "active" : ""}`}
                    onClick={() => onChange(index)}
                >

                    {tab.label ?? tab.title}

                </button>

            ))}

        </nav>

    );

}