export function createExperience({

    workspace = {},

    navigation = [],

    commands = [],

    capabilities = [],

    metadata = {},

}) {

    return {

        workspace,

        navigation,

        commands,

        capabilities,

        metadata,

    };

}