export function createWorkspaceBannerModel({

    title,

    mode = null,

    metric = null,

    onClose = null,

}) {

    return {

        title,

        mode,

        metric,

        onClose,

    };

}