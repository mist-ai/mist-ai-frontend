import React, { useEffect, useRef, memo } from 'react';

const SymbolOverviewChart: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !containerRef.current.querySelector('script')) {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                symbols: [
                    ["CSELK:SAMP.N0000|1D"],
                    ["CSELK:JKH.N0000|1D"]
                ],
                chartOnly: false,
                locale: "en",
                width: "500",
                colorTheme: "light",
                autosize: true,
                showVolume: false,
                showMA: false,
                hideDateRanges: false,
                hideMarketStatus: false,
                hideSymbolLogo: false,
                scalePosition: "right",
                scaleMode: "Normal",
                fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                fontSize: "10",
                noTimeScale: false,
                valuesTracking: "1",
                changeMode: "price-and-percent",
                chartType: "area",
                maLineColor: "#2962FF",
                maLineWidth: 1,
                maLength: 9,
                headerFontSize: "medium",
                lineWidth: 2,
                lineType: 0,
                dateRanges: [
                    "1d|1",
                    "1m|30",
                    "3m|60",
                    "12m|1D",
                    "60m|1W",
                    "all|1M"
                ]
            });
            containerRef.current.appendChild(script);
        }
    }, []);

    return (
        <div className="tradingview-widget-container" ref={containerRef}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(SymbolOverviewChart);
