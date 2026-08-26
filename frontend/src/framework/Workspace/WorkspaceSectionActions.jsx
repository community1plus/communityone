import "./WorkspaceSectionActions.css";


export function WorkspaceSectionActions({
    actions = [],
}) {

    console.log(
        "🔥 WorkspaceSectionActions RENDERED",
        actions
    );

    if (!actions.length) {
        return null;
    }

    if (!Array.isArray(actions) || !actions.length) {
        return null;
    }


return (
    <div
        style={{
            display: "flex",
            gap: "10px",
            padding: "10px",
            background: "yellow",
            border: "3px solid red",
            color: "black",
            position: "relative",
            zIndex: 99999,
        }}
    >
        <button
            type="button"
            style={{
                display: "block",
                padding: "10px 20px",
                background: "white",
                color: "black",
                border: "2px solid black",
            }}
        >
            ACTION TEST
        </button>
    </div>
);

}