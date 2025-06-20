import Card from './Card';
import { Avatar } from '@refractor-labs/design-system-vite';
import Blockies from 'react-blockies';
import CopyAddressButton from '../CopyAddressButton';
import { shortenHex } from 'src/utils/address';
import { SqualletUserDetailed } from 'src/types';

type Props = {
    user: SqualletUserDetailed;
};
const SignerCard = ({ user }: Props) => {
    const userAddress: string = user.user.address as string;
    return (
        <Card className="py-4">
            <div className="flex flex-col gap-4 items-center justify-between text-default md:flex-row">
                <div className="flex flex-row justify-center gap-2 items-center w-full md:justify-start">
                    <Avatar size={'xxlarge'} className=" items-center">
                        <Blockies className="rounded-full" seed={userAddress} size={48} scale={7} />
                    </Avatar>
                    <div className="flex flex-col gap-4 justify-center">
                        <div className="flex flex-col items-start">
                            <span className="text-md text-default-focus">
                                {shortenHex(userAddress)}
                            </span>
                            <CopyAddressButton address={userAddress} />
                        </div>
                    </div>
                </div>
                <div className="flex w-4/5 justify-between">
                    <div className="flex flex-col items-start gap-2">
                        <span>Vault equity</span>
                        <span>Role</span>
                        <span>Membership NFT</span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-default-focus">0.00%</span>
                        <span className="text-default-focus">{user.role}</span>
                        <span>Mint NFT</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SignerCard;
