import Field from "../UI/Form/Field";
import Input from "../UI/Form/Input";
import ProfileCard from "./ProfileCard";

export default function ProfileUserSection({
  form,
  readOnly,
}) {

  return (

    <ProfileCard>

      <Field
        label="Display Name"
      >

        <Input
          value={
            form.getValue(
              "display_name"
            ) || ""
          }

          onChange={(e)=>
            form.setValue(
              "display_name",
              e.target.value
            )
          }

          readOnly={readOnly}
        />

      </Field>

      <Field
        label="Username"
      >

        <Input
          value={
            form.getValue(
              "username"
            ) || ""
          }

          onChange={(e)=>
            form.setValue(
              "username",
              e.target.value
            )
          }

          readOnly={readOnly}
        />

      </Field>

    </ProfileCard>

  );

}