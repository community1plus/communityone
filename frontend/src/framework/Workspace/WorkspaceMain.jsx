/* =========================================
   WORKSPACE MAIN
========================================= */

.workspace-main {

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        360px;

    grid-template-areas:
        "content sidebar";

    column-gap: 40px;

    width: 100%;
    min-width: 0;

    margin: 0;
    padding: 0;

    box-sizing: border-box;

    align-items: start;

}


/* =========================================
   CONTENT
========================================= */

.workspace-main
.workspace-content {

    grid-area: content;

    min-width: 0;
    width: 100%;

}


/* =========================================
   SIDEBAR
========================================= */

.workspace-main
.workspace-sidebar {

    grid-area: sidebar;

    min-width: 0;
    width: 100%;

}