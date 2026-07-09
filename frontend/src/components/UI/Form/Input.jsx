import "./WorkspaceInput.css";

export default function Input({

    value,
    onChange,
    placeholder,
    type = "text",
    autoComplete = "off",
    className = "",
    ...props

}) {

    return (

        <input
            className={`workspace-input ${className}`}
            type={type}
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...props}
        />

    );

}