import { SubmitHandler, useForm } from "react-hook-form";

type FieldValues = { remoteId: string };

export type FormProps = {
  onSubmit: SubmitHandler<FieldValues>;
};

function Form({ onSubmit }: FormProps): JSX.Element {
  const { handleSubmit, register } = useForm<FieldValues>({
    defaultValues: {
      remoteId: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("remoteId", { required: true })} />
      <button type="submit">Call</button>
    </form>
  );
}

export default Form;
