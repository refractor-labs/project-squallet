import { TxResponse } from '@refractor-labs/api-client';
import { ethers } from 'ethers';
import { shortenHex, useChecksummedAddress } from 'src/utils/address';
import { formatDate } from 'src/utils/date';
import Card from './Card';
import { BigNumber } from '@ethersproject/bignumber';

type Props = {
    transaction: TxResponse;
};

const TransactionCard = ({ transaction }: Props) => {
    const gas = ethers
        .formatEther(
            BigNumber.from(transaction?.gasUsed)
                .mul(BigNumber.from(transaction?.effectiveGasPrice))
                .toBigInt(),
        )
        .slice(0, 5);

    const { checksummedAddress } = useChecksummedAddress(transaction.from);

    return (
        <Card className="flex justify-between item-center" isClickable={false}>
            <div className="flex gap-2 items-center">
                <span>{formatDate(new Date(transaction.createdAt))}</span>
                <span>&middot;</span>
                <a href="#" className="underline">
                    <span>{shortenHex(transaction?.hash)}</span>
                </a>
            </div>
            <div className="flex flex-col items-end justify-center ">
                <span>{gas} ETH</span>
                <span>
                    Paid by:{' '}
                    <a href="#" className="underline">
                        {shortenHex(checksummedAddress)}
                    </a>
                </span>
            </div>
        </Card>
    );
};

export default TransactionCard;
