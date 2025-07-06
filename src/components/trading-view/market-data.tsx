import { MarketDataList } from "@/models/trading-view-widgets";
import React, { useEffect, useRef } from "react";

const MarketData: React.FC<MarketDataList> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
      script.async = true;
      script.innerHTML = JSON.stringify({
        width: 800,
        height: 450,
        symbolsGroups: props.marketData,
        showSymbolLogo: true,
        isTransparent: false,
        colorTheme: "light",
        locale: "en",
        backgroundColor: "#ffffff",
      });

      containerRef.current.appendChild(script);

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
    }
  }, [props.marketData]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default MarketData;
