import React, { memo, useEffect, useRef } from 'react';

const StockMarketWidget: React.FC = () => {
    const widgetContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme: 'light',
            height: '450',
            width: '350',
            dateRange: '12M',
            exchange: 'US',
            showChart: true,
            locale: 'en',
            largeChartUrl: '',
            isTransparent: false,
            showSymbolLogo: false,
            showFloatingTooltip: false,
            plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
            plotLineColorFalling: 'rgba(41, 98, 255, 1)',
            gridLineColor: 'rgba(42, 46, 57, 0)',
            scaleFontColor: 'rgba(219, 219, 219, 1)',
            belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
            belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
            belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
            belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
            symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
        });

        if (widgetContainerRef.current) {
            widgetContainerRef.current.appendChild(script);
        }

        return () => {
            if (widgetContainerRef.current) {
                widgetContainerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="tradingview-widget-container" ref={widgetContainerRef}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
};

export default memo(StockMarketWidget);