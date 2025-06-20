import { FocusEventHandler } from 'react';

import { Form } from '@refractor-labs/design-system-vite';
import { Field } from 'formik';

export type InputProps = {
    label?: string;
    name: string;
    placeholder?: string;
    type: 'text' | 'number';
    intent:
        | 'input'
        | 'currency'
        | 'search'
        | 'date'
        | 'multiSelect'
        | 'password'
        | 'quantity'
        | 'select'
        | 'textArea';
    required?: boolean;
    disabled?: boolean;
};

type Props = {
    input: InputProps;
    value: any;
    onChange: any;
    onBlur: FocusEventHandler;
};

export const Input = ({ input, value, onChange, onBlur }: Props) => {
    const props = {
        intent: input.intent,
        onBlur: onBlur,
        required: input.required,
        disabled: input.disabled,
    };

    return (
        <>
            <Field name={input.name}>
                {({ field }) => (
                    <Form.Item
                        {...props}
                        intent={input.intent}
                        label={input.label}
                        placeholder={input.placeholder}
                        type={input.type}
                        fieldType={input.intent === 'textArea' ? 'textArea' : 'input'}
                        {...field}
                    />
                )}
            </Field>
        </>
    );
};
