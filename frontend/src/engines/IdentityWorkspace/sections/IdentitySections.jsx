// IdentitySections.jsx

export  const identitySections = ({
    form,
    editing
}) => ({

    social: (
        <IdentitySocialSection
            form={form}
            editing={editing}
        />
    ),

    payment: (
        <IdentityPaymentSection
            form={form}
            editing={editing}
        />
    ),

});