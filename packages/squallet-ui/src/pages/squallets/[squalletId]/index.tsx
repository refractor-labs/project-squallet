import { useContext } from 'react';
import Card from 'src/components/Cards/Card';
import { SqualletContext } from 'src/components/Contexts/Squallet';
import { DashboardCollectiveNetWorth } from 'src/components/SqualletDashboard/DashboardCollectiveNetWorth';
import DashboardHeatmap from 'src/components/SqualletDashboard/DashboardHeatmap';
import { DashboardNFTPortfolioList } from 'src/components/SqualletDashboard/DashboardNFTPortfolioList';
import SqualletMemberList from 'src/components/SqualletDashboard/SqualletMemberList';
import SqualletProfileHeader from 'src/components/SqualletDashboard/SqualletProfileHeader';

export type Squallet = {
    id: string;
};

export default function Home() {
    const squallet = useContext(SqualletContext);

    if (!squallet) {
        return;
    }
    return (
        <>
            <div className="min-h-screen">
                <div className="w-full flex flex-col gap-4">
                    <SqualletProfileHeader squallet={squallet} />
                    <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex flex-col w-full gap-4 lg:w-1/2">
                            <Card>Mission</Card>
                            <SqualletMemberList />
                            <DashboardHeatmap />
                        </div>
                        <div className="flex flex-col w-full gap-4 lg:w-1/2">
                            <DashboardCollectiveNetWorth />
                            <Card>History</Card>
                            <Card>Token Balance Value</Card>
                            <DashboardNFTPortfolioList />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
