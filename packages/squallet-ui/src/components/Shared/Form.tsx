import { ErrorMessage, Formik, Form as FormikForm } from 'formik';
import { Input, InputProps } from './Input';
import { toFormikValidate } from 'zod-formik-adapter';

type Props<T> = {
    value?: T | null;
    inputs: InputProps[];
    onSubmit: (values: T) => Promise<void>;
    submitText?: string;
    children?: React.ReactNode;
    validationSchema: any;
};

const Form = <T,>({ value, onSubmit, inputs, children, validationSchema }: Props<T>) => {
    return (
        <div>
            <Formik
                initialValues={{
                    ...value,
                }}
                validateOnChange={true}
                validateOnBlur={true}
                validate={toFormikValidate(validationSchema)}
                onSubmit={async (values: any, { setSubmitting }) => {
                    const data: { [key: string]: any } = {
                        ...values,
                    };
                    await onSubmit(data as T);
                    setSubmitting(false);
                }}
            >
                {({ values, handleChange, handleBlur }) => (
                    <FormikForm>
                        {inputs.map((input, index) => (
                            <div key={index} className="mb-4">
                                <Input
                                    input={input}
                                    value={(values as any)[input.name]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <ErrorMessage
                                    name={input.name}
                                    component="span"
                                    className="text-red text-xs"
                                />
                            </div>
                        ))}
                        {children}
                    </FormikForm>
                )}
            </Formik>
        </div>
    );
};

export default Form;
