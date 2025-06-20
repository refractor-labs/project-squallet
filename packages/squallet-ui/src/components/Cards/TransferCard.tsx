import { TransferResponse } from '@refractor-labs/api-client';
import { shortenHex, useChecksummedAddress } from 'src/utils/address';
import { formatDate } from 'src/utils/date';
import Blockies from 'react-blockies';
import { Chip } from '@refractor-labs/design-system-vite';

interface ITransferCard {
    transfer: TransferResponse;
}

const TransferCard = ({ transfer }: ITransferCard) => {
    const { checksummedAddress } = useChecksummedAddress(
        transfer.direction === 'IN' ? transfer.from : transfer.to,
    );
    return (
        <>
            <div className="flex flex-col py-6 gap-2 border-b border-default-muted">
                <div className="flex items-center gap-1">
                    <Chip
                        intent={transfer.direction === 'IN' ? 'green' : 'orange'}
                        className="mr-1"
                    >
                        {transfer.direction}
                    </Chip>
                    <img
                        className="rounded-md h-6"
                        alt="preview"
                        src={transfer?.nft?.nftToken?.previewUrl ?? ''}
                    />
                    <span className="text-default-focus">
                        {transfer?.nft?.quantity} {transfer?.nft?.nftToken?.nftCollection.name}
                    </span>

                    <span> {transfer.direction === 'IN' ? 'from' : 'to'}</span>
                    <Blockies className="rounded-full" size={6} seed={checksummedAddress} />
                    <span className="text-default-focus">{shortenHex(checksummedAddress)}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <span>{formatDate(new Date(transfer.transaction.minedAt))}</span>
                    <span>&middot;</span>
                    <a href="#" className="underline">
                        <span>{shortenHex(transfer.transferHash.split(':')[0])}</span>
                    </a>
                </div>
            </div>
        </>
    );
};

export default TransferCard;
