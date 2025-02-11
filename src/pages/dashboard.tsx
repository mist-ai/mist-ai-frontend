import React from 'react';
import SymbolOverviewChart from '../components/trading-view/symbol-overview-chart';
import AdvRTChart from '../components/trading-view/adv-real-time-chart';
import StockMarketWidget from '@/components/trading-view/stock-market-widget';
import TickersSlider from '@/components/trading-view/tickers-slider';
import MarketData from '@/components/trading-view/market-data';

const Dashboard: React.FC = () => {
    const [showChat, setShowChat] = React.useState(false);

    const widgets = [
        { id: 1, component: <AdvRTChart /> },
        { id: 2, component: <SymbolOverviewChart /> },
        { id: 3, component: <StockMarketWidget /> },
        { id: 4, component: <MarketData /> },
    ];

    return (
        <div className='p-2'>
            <div className='text-lg mb-4 font-semibold'>MIST.ai Dashboard</div>
            <div className='fixed bottom-4 right-4'>
                <button
                    className='bg-blue-500 text-white p-3 px-6 rounded-full shadow-lg'
                    onClick={() => setShowChat(true)}
                >
                    Chat
                </button>
                {showChat && (
                    <>
                        <div
                            className='fixed inset-0 bg-black opacity-70'
                            onClick={() => setShowChat(false)}
                        ></div>
                        <div className='fixed bottom-24 right-8 w-1/3 h-2/3 bg-white shadow-lg border p-4 rounded-xl'>
                            <div className='flex justify-between items-center mb-2'>
                                <div className='text-lg font-semibold'>Chat</div>
                                <button onClick={() => setShowChat(false)}>Close</button>
                            </div>
                            <div className='h-full overflow-y-auto'>
                                {/* Chat content goes here */}
                            </div>
                        </div>
                    </>
                )}
            </div>
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
