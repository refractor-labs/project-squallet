import { FC, useState } from 'react';
import { shortenHex } from 'src/utils/address';
import Check from 'src/icons/Check';
import Copy from 'src/icons/Copy';

interface ICopyAddressButton {
    disabled?: boolean;
    address: string;
    fullText?: boolean;
}

const CopyAddressButton: FC<ICopyAddressButton> = ({ address }) => {
    const [addressCopied, setAddressCopied] = useState(false);
    const copyAddress = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        navigator.clipboard.writeText(address);
        setAddressCopied(true);
    };

    return (
        <div
            className="flex items-center gap-2 bg-background-default-secondary text-default hover:cursor-pointer"
            onClick={(e) => copyAddress(e)}
        >
            {shortenHex(address, 4)}
            {addressCopied ? <Check /> : <Copy />}
        </div>
    );
};

export default CopyAddressButton;
