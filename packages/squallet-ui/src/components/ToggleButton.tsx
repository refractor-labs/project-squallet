type Props = {
    primaryOption: string;
    secondaryOption: string;
    selected: boolean;
    onClick: () => void;
};

const ToggleButton = ({ primaryOption, secondaryOption, selected, onClick }: Props) => {
    const baseClasses = 'flex items-center justify-center w-1/2 rounded-full cursor-pointer p-1';
    const selectedClasses = 'bg-background-deep-purple text-deep-purple';

    return (
        <div className="flex border border-default-muted justify-between bg-default-inverted rounded-full p-2 text-lg">
            <div className={`${baseClasses} ${selected ? selectedClasses : ''}`} onClick={onClick}>
                {primaryOption}
            </div>
            <div className={`${baseClasses} ${!selected ? selectedClasses : ''}`} onClick={onClick}>
                {secondaryOption}
            </div>
        </div>
    );
};

export default ToggleButton;
