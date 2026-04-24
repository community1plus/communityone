import Input from "./Input";
import Select from "./Select";
import Field from "./Field";

export default function FormBuilder({
  steps,
  currentStep,
  form,
  extra = {},
}) {
  const {
    getValue,
    handleChange,
    handleBlur,
    getError,
    isValidating,
    isFieldValid,
  } = form;

  const renderField = (field) => {
    const { name, label, type, readOnly, options } = field;

    /* =========================
       COMMON FIELD STATE
    ========================= */

    const error = getError(name);
    const loading = isValidating(name);
    const success = isFieldValid(name);

    /* =========================
       LOCATION FIELD
    ========================= */

    if (type === "location") {
      const {
        Autocomplete,
        autoRef,
        manualAddress,
        setManualAddress,
        onPlaceChanged,
      } = extra;

      return (
        <Field
          key={name}
          label={label}
          error={error}
          loading={loading}
          success={success}
        >
          <Autocomplete
            onLoad={(auto) => (autoRef.current = auto)}
            onPlaceChanged={onPlaceChanged}
          >
            <Input
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
          </Autocomplete>
        </Field>
      );
    }

    /* =========================
       SELECT FIELD
    ========================= */

    if (type === "select") {
      return (
        <Field
          key={name}
          label={label}
          error={error}
          loading={loading}
          success={success}
        >
          <Select
            value={getValue(name)}
            onChange={handleChange(name, field)}
            onBlur={handleBlur(name, field)}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    }

    /* =========================
       DEFAULT INPUT
    ========================= */

    return (
      <Field
        key={name}
        label={label}
        error={error}
        loading={loading}
        success={success}
      >
        <Input
          value={getValue(name)}
          onChange={handleChange(name, field)}
          onBlur={handleBlur(name, field)}
          readOnly={readOnly}
        />
      </Field>
    );
  };

  return <>{steps[currentStep].fields.map(renderField)}</>;
}