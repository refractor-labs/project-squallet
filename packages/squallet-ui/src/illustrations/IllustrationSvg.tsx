type svgProps = {
    className?: string;
    muted: boolean;
    shade?: number | undefined;
    strokeShade?: number | undefined;
    d: string;
};

const getStyle = (props: svgProps): string => {
    const { shade } = props;
    const { strokeShade } = props;
    const { muted } = props;

    if (shade) {
        switch (shade) {
            case 1:
                return '#040303';
            case 5:
                return '#FFFFFF';
        }
    }

    if (strokeShade) {
        switch (strokeShade) {
            case 1:
                return '#FFFFFF';
            case 5:
                return '#FFFFFF';
        }
    }

    return '';
};

export const Path = (props: svgProps) => {
    const { shade, strokeShade, muted, d } = props;

    let fill;
    let stroke;

    if (shade) {
        fill = getStyle(props);
    }
    if (strokeShade) {
        stroke = getStyle(props);
    }

    return <path d={d} fill={fill} stroke={stroke}></path>;
};
