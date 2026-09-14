import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";
switch (capability) {
    case "wallet":
        return <WalletNavigation />;

    case "identity":
    default:
        return (
            <IdentityCapabilitySelector
                values={values}
                setValue={form.setValue}
                readOnly={!editing}
            />
        );
}