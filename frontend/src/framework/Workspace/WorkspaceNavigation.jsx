import "./WorkspaceNavigation.css";
export default function WorkspaceNavigation({

    model,

}) {

    if (!model.visible) {

        return null;

    }

    return (

        <nav className="workspace-navigation">

            {model.items.map((item, index) => (

                <button
                    key={item.id}
                    type="button"
                    className={`workspace-tab
                        ${model.current === index ? "active" : ""}
                        ${index < model.current ? "complete" : ""}
                    `}
onClick={() => {

    console.log(
        "NAVIGATION CLICK",
        index,
        item.id
    );

    model.onChange(index);

}}
                >

                    {item.title}

                </button>

            ))}

        </nav>

    );

}