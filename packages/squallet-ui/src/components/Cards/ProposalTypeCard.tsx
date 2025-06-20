import { Callout } from '@refractor-labs/design-system-vite';
import Card from './Card';
import Link from 'next/link';
import { useContext } from 'react';
import { SqualletContext } from '../Contexts/Squallet';
import { motion } from 'framer-motion';

type Props = {
    title: string;
    page: string;
};

const ProposalTypeCard = ({ title, page }: Props) => {
    const squallet = useContext(SqualletContext);
    return (
        <Link key={title} href={`/squallets/${squallet?.id}/add-proposal/${page}`}>
            <Card>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex flex-col">
                        <span className="header-sm-caps">Proposal</span>
                        <span className="header-xs text-default-focus">{title}</span>
                    </div>
                </motion.div>
            </Card>
        </Link>
    );
};

export default ProposalTypeCard;
