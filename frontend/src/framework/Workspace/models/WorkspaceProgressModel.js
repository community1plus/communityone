export function createWorkspaceProgressModel({
    value = 0,
    label,
}) {
    return {
        value,
        label,
    };
}