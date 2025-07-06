import { TickersSliderWidgetProps } from "@/models/trading-view-widgets";
import React, { useEffect } from "react";

const TickersSlider: React.FC<TickersSliderWidgetProps> = (props) => {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: props.tickers,
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "en",
      width: "100%",
    });
    document
      .getElementsByClassName("tradingview-widget-container__widget")[0]
      .appendChild(script);
  }, [props.tickers]);

  return (
    <div className="tradingview-widget-container w-full h-16">
      <div className="tradingview-widget-container__widget w-full h-full"></div>
    </div>
  );
};

export default TickersSlider;
