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
        width: "100%",
        height: "100%",
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
    <div
      className="tradingview-widget-container w-full h-full min-h-[400px]"
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
};

export default MarketData;
