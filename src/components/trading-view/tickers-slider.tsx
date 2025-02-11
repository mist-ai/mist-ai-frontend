import React, { useEffect } from 'react';

const TickersSlider: React.FC = () => {
    useEffect(() => {
        if (!document.querySelector('script[src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
            script.async = true;
            script.innerHTML = JSON.stringify({
                symbols: [
                    { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500 Index' },
                    { proName: 'FOREXCOM:NSXUSD', title: 'US 100 Cash CFD' },
                    { proName: 'FX_IDC:EURUSD', title: 'EUR to USD' },
                    { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
                    { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
                ],
                showSymbolLogo: true,
                isTransparent: false,
                displayMode: 'adaptive',
                colorTheme: 'light',
                locale: 'en',
                width: '1900',
            });
            document.getElementsByClassName('tradingview-widget-container__widget')[0].appendChild(script);
        }
    }, []);

    return (
        <div className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};

export default TickersSlider;
