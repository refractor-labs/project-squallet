import { ReactNode } from 'react';
import classNames from 'classnames';

/**
 * Renders a Card component
 */

type Props = {
    children: ReactNode;
    isClickable?: boolean;
    className?: string;
};

export default function Card({ children, isClickable = true, className }: Props) {
    const defaultClassName = 'border p-3 border-line-default-primary rounded-lg h-full md:p-6';
    const hoverClassName =
        'hover:border-line-default-focus hover:bg-background-default-secondary hover:cursor-pointer';
    const additionalClassName = className ? className : '';
    const combinedClassName = classNames(
        defaultClassName,
        { [hoverClassName]: isClickable },
        { [additionalClassName]: true },
    );
    return (
        <>
            <div className={combinedClassName}>{children}</div>
        </>
    );
}
