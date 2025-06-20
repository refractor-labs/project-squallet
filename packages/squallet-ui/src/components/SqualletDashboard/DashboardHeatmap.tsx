import {
    Button,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@refractor-labs/design-system-vite';
import Link from 'next/link';
import { useContext, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { SqualletContext } from '../Contexts/Squallet';

const generateData = () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();

    const data: any = [];
    const countRange = [1, 2, 3, 4];

    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(
            startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()),
        );
        const date = currentDate.toISOString().slice(0, 10);
        const count = countRange[Math.floor(Math.random() * countRange.length)];
        data.push({ date, count });
    }

    return data;
};

function subtract6Months(date) {
    date.setMonth(date.getMonth() - 6);

    return date;
}

const today = new Date();
export const sixMonthsAgo = subtract6Months(new Date());

const DashboardHeatmap = () => {
    const [selectedHeatmap, setSelectedHeatmap] = useState('transactions');
    const squallet = useContext(SqualletContext);

    return (
        <div className="p-sp24 rounded-lg border border-line-default-primary">
            <div className="grid grid-cols-2 items-center mb-2">
                <p className="header-xs text-default-focus">Activity</p>
                <Select
                    value={selectedHeatmap}
                    onValueChange={setSelectedHeatmap}
                    defaultValue="transactions"
                >
                    <SelectTrigger>
                        <SelectValue placeholder={'Transactions'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={'transactions'}>Transactions</SelectItem>
                            <SelectItem value={'proposals'}>Proposals</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <CalendarHeatmap
                tooltipDataAttrs={(value) => {
                    return { 'data-tooltip': 'Tooltip: ' + value.count };
                }}
                showMonthLabels={true}
                showOutOfRangeDays={true}
                startDate={sixMonthsAgo}
                endDate={today}
                classForValue={(value) => {
                    if (!value) {
                        return 'color-empty';
                    }
                    switch (value.count) {
                        case 1:
                            return 'color-github-1';
                        case 2:
                            return 'color-github-2';
                        case 3:
                            return 'color-github-3';
                        case 4:
                            return 'color-github-4';
                        default:
                            return 'color-github-4';
                    }
                }}
                values={generateData()}
            />
            {selectedHeatmap === 'transactions' ? (
                <Link
                    className="w-full block mt-[10px]"
                    href={`/squallets/${squallet?.id}/transactions`}
                >
                    <Button intent="outline" fullWidth={true}>
                        View transactions
                    </Button>
                </Link>
            ) : (
                <Link
                    className="w-full block mt-[10px]"
                    href={`/squallets/${squallet?.id}/proposals`}
                >
                    <Button intent="outline" fullWidth={true}>
                        View proposals
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default DashboardHeatmap;
