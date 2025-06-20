import { Pkp, Squallet } from 'src/prisma';
import Card from './Card';
import { shortenHex } from 'src/utils/address';
import Blockies from 'react-blockies';

type Props = {
    squallet: Squallet & {
        pkp: Pkp[];
    };
};

const SqualletCard = ({ squallet }: Props) => {
    return (
        <Card className="overflow-hidden flex items-center gap-4 h-full shadow-md">
            <Blockies
                seed={squallet.pkp[0].pkpAddress}
                size={10}
                scale={4}
                className="rounded-full"
            />
            <div className=" flex flex-col justify-start">
                <strong> {squallet?.name}</strong>

                {!squallet?.pkp?.length ? (
                    <span className="text-yellow">Needs activation</span>
                ) : (
                    <>
                        <div className="min-h-18">
                            <p>{shortenHex(squallet.pkp[0].pkpAddress)}</p>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};

export default SqualletCard;
