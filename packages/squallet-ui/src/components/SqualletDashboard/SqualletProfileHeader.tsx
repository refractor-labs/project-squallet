import { Avatar } from '@refractor-labs/design-system-vite';
import Blockies from 'react-blockies';
import CopyAddressButton from '../CopyAddressButton';
import { useState } from 'react';
import EditSqualletModal from '../EditSqualletModal';
import { Pkp, Squallet } from 'src/prisma';

type Props = {
    squallet: Squallet & {
        pkp: Pkp[];
    };
};

export const SqualletProfileHeader = ({ squallet }: Props) => {
    const pkpAddress = squallet?.pkp[0].pkpAddress;
    const [name, setName] = useState<string>(squallet?.name);

    const handleNameChange = (name: string) => {
        setName(name);
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Avatar size={'xxlarge'} hasEditButton className="bg-BrandViolet300 items-center">
                    <Blockies className="rounded-full" seed={pkpAddress} size={48} scale={7} />
                </Avatar>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                        <span className="text-md text-default-focus">{name}</span>

                        <EditSqualletModal onSubmit={handleNameChange} />
                    </div>

                    <CopyAddressButton address={pkpAddress} />
                </div>
            </div>
        </>
    );
};

export default SqualletProfileHeader;
