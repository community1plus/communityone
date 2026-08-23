import "./WorkspaceTabs.css";
export default function WorkspaceTabs({

    model,

}) {

    if (!model.visible) {

        return null;

    }

    return (

        <nav className="workspace-tabs">

            {model.items.map((item, index) => (

                <button
                    key={item.id}
                    type="button"
                    className={`
                        workspace-tab
                        ${model.current === index ? "active" : ""}
                        ${index < model.current ? "complete" : ""}
                    `}
                    onClick={() => model.onChange(index)}
                >

                    {item.title}

                </button>

            ))}

        </nav>

    );

}