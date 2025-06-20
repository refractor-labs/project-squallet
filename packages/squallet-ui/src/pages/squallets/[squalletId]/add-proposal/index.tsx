import ProposalTypeCard from 'src/components/Cards/ProposalTypeCard';

export default function Home() {
    return (
        <>
            <div className="min-h-screen ">
                <span className="text-default-focus text-3xl font-bold">Add Proposal</span>

                <div className="card-grid">
                    <ProposalTypeCard title="Modify Members" page="modify-members" />
                    <ProposalTypeCard title="Sign Transaction" page="sign-transaction" />
                    <ProposalTypeCard title="Sign Message" page="sign-message" />
                </div>
            </div>
        </>
    );
}
