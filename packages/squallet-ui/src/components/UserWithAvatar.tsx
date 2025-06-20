import { shortenHex, useChecksummedAddress } from 'src/utils/address';
import Blockies from 'react-blockies';

type Props = {
    userAddress: string;
    short: boolean;
    size?: number;
};

const UserWithAvatar = ({ userAddress, short, size = 8 }: Props) => {
    const { checksummedAddress } = useChecksummedAddress(userAddress);
    return (
        <div className="flex items-center">
            <Blockies size={size} seed={checksummedAddress} className="rounded-full" />

            <div className="text-default-focus text-md p-4">
                {short ? shortenHex(checksummedAddress) : checksummedAddress}
            </div>
        </div>
    );
};

export default UserWithAvatar;
