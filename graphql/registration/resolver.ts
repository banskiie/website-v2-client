import gql from "graphql-tag";

export const REGISTRY_ENTRY = gql`
    mutation RegistryEntry($input: RegisterEntryInput!) {
        registerEntry(input: $input) {
            ok
            message
        }
    }
`