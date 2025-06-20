import React, { FC } from 'react';

interface ICheck {
    color?: string;
    size?: string | number;
    strokeWidth?: number;
}
const Check: FC<ICheck> = ({ color = 'currentColor', size = 16, strokeWidth = 3, ...rest }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0, 0, 24, 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default Check;
