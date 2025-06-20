import Card from '../Cards/Card';
import UserWithAvatar from '../UserWithAvatar';
import { useContext } from 'react';
import { SqualletContext } from '../Contexts/Squallet';
import { Button } from '@refractor-labs/design-system-vite';

const SqualletMemberList = () => {
    const squallet = useContext(SqualletContext);
    const members = squallet?.users;
    return (
        <Card isClickable={false}>
            <p className="header-xs text-default-focus">Members ({members?.length})</p>
            {members?.map((member, i) => (
                <UserWithAvatar key={i} userAddress={member.user.address} short={true} />
            ))}
            <Button fullWidth intent="outline">
                View Members
            </Button>
        </Card>
    );
};

export default SqualletMemberList;
