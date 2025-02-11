import React, { useEffect, useRef, memo } from 'react';

const AdvRTChart: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            // Clear any existing script
            containerRef.current.innerHTML = "";

            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                autosize: true,
                symbol: "SAMP.N0000",
                interval: "D",
                height: "450",
                width: "900",
                timezone: "Etc/UTC",
                theme: "light",
                style: "1",
                locale: "en",
                allow_symbol_change: true,
                calendar: false,
                support_host: "https://www.tradingview.com"
            });
            containerRef.current.appendChild(script);
        }
    }, []);

    return (
        <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
        </div>
    );
}

export default memo(AdvRTChart);