import React, { useEffect, useRef } from 'react';

const MarketData: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            width: 800,
            height: 550,
            symbolsGroups: [
                {
                    name: 'Indices',
                    originalName: 'Indices',
                    symbols: [
                        { name: 'CSELK:SAMP.N0000', displayName: 'Sampath' },
                        { name: 'CSELK:JKH.N0000', displayName: 'John Keells' },
                        { name: 'CSELK:SINS.N0000', displayName: 'Singer' },
                        { name: 'CSELK:LIOC.N0000', displayName: 'LIOC' },
                    ],
                },
                {
                    name: 'Conversion',
                    originalName: 'Conversion',
                    symbols: [
                        { name: 'FX_IDC:LKRUSD', displayName: 'LKR to USD' },
                    ],
                },
            ],
            showSymbolLogo: true,
            isTransparent: false,
            colorTheme: 'light',
            locale: 'en',
            backgroundColor: '#ffffff',
        });

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="tradingview-widget-container" ref={containerRef}>
            <div className="tradingview-widget-container__widget"></div>

        </div>
    );
};

export default MarketData;
