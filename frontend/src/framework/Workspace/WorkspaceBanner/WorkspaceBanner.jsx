/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   Workspace Banner
   ========================================================== */

export default function WorkspaceBanner({

    children,

    left,
    center,
    right,

}) {

    return (

        <div className="workspace-banner">

            {/* =========================================
               LEFT
            ========================================= */}

            <div className="workspace-banner-left">

                {left}

            </div>


            {/* =========================================
               CENTER
            ========================================= */}

            <div className="workspace-banner-center">

                {center}

            </div>


            {/* =========================================
               RIGHT
            ========================================= */}

            <div className="workspace-banner-right">

                {right}

            </div>


            {children}

        </div>

    );

}