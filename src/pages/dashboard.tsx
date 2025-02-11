import React from 'react';
import SymbolOverviewChart from '../components/trading-view/symbol-overview-chart';
import AdvRTChart from '../components/trading-view/adv-real-time-chart';
import StockMarketWidget from '@/components/trading-view/stock-market-widget';
import TickersSlider from '@/components/trading-view/tickers-slider';
import MarketData from '@/components/trading-view/market-data';

const Dashboard: React.FC = () => {
    const widgets = [
        { id: 1, component: <AdvRTChart /> },
        { id: 2, component: <SymbolOverviewChart /> },
        { id: 3, component: <StockMarketWidget /> },
        { id: 4, component: <MarketData /> },
        // Add more widgets here
    ];

    return (
        <div className='p-2'>
            <div className='text-lg mb-4 font-semibold'>MIST.ai Dashboard</div>
            <div className='w-full mb-4'><TickersSlider /></div>
            <div className="flex flex-wrap gap-4 justify-center">
                {widgets.map(widget => (
                    <div key={widget.id} className='flex'>
                        {widget.component}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;