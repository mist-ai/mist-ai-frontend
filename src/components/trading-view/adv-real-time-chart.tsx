import { AdvRTChartProps } from "@/models/trading-view-widgets";
import { memo } from "react";

const AdvRTChart: React.FC<AdvRTChartProps> = (props) => {
  return (
    <div className="tradingview-widget-container">
      <iframe
        title="TradingView Chart"
        src={`https://www.tradingview.com/widgetembed/?symbol=${props.symbol}&interval=D&theme=light&style=1&locale=en`}
        width="900"
        height="450"
      ></iframe>
    </div>
  );
};

export default memo(AdvRTChart);
