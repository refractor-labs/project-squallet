import Card from '../Cards/Card';

export const DashboardCollectiveNetWorth = () => {
    return (
        <Card>
            <div className="flex justify-between items-center">
                <p className="header-xs text-default-focus">NFT portfolio</p>
            </div>
            <div className="flex flex-col w-full">
                <p className="header-lg text-default-focus">0 ETH</p>
            </div>
        </Card>
    );
};
