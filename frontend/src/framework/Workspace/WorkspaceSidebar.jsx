import "./WorkspaceSidebar.css";
export default function WorkspaceSidebar({

    children,

}) {

    return (

        <aside className="workspace-sidebar">

            <div className="workspace-sidebar-inner">

                {children}

            </div>

        </aside>

    );

}