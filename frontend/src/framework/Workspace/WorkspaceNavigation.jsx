import "./WorkspaceNavigation.css";


export default function WorkspaceNavigation({

    model,

}) {

    if (!model?.visible) {

        return null;

    }


    return (

        <nav
            className="workspace-navigation"
            aria-label="Section navigation"
        >

            {model.items.map((item, index) => (

                <button
                    key={item.id}
                    type="button"
                    className={[
                        "workspace-tab",
                        model.current === index && "active",
                        index < model.current && "complete",
                    ]
                        .filter(Boolean)
                        .join(" ")
                    }
                    onClick={() => model.onChange?.(index)}
                    aria-current={
                        model.current === index
                            ? "page"
                            : undefined
                    }
                >

                    {item.title}

                </button>

            ))}

        </nav>

    );

}