import { SymbolOverviewChartProps } from "@/models/trading-view-widgets";
import React, { useEffect, useRef, memo } from "react";

const SymbolOverviewChart: React.FC<SymbolOverviewChartProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Clear any existing script
      container.innerHTML = "";

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: props.symbols,
        chartOnly: false,
        locale: "en",
        width: "100%",
        height: "100%",
        colorTheme: "light",
        autosize: true,
        showVolume: false,
        showMA: false,
        hideDateRanges: false,
        hideMarketStatus: false,
        hideSymbolLogo: false,
        scalePosition: "right",
        scaleMode: "Normal",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
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
        dateRanges: ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
      });
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [props.symbols]);

  return (
    <div
      className="tradingview-widget-container w-full h-full min-h-[350px]"
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
};

export default memo(SymbolOverviewChart);
