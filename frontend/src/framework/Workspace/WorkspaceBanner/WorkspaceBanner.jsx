/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   Workspace Banner
   ========================================================== */

export default function WorkspaceBanner({

    left = null,
    center = null,
    right = null,

}) {

    return (

        <div className="workspace-banner">

            <div className="workspace-banner-left">
                {left}
            </div>

            <div className="workspace-banner-center">
                {center}
            </div>

            <div className="workspace-banner-right">
                {right}
            </div>

        </div>

    );

}