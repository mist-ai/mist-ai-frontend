import { AdvRTChartProps } from "@/models/trading-view-widgets";
import { memo } from "react";

const AdvRTChart: React.FC<AdvRTChartProps> = (props) => {
  // Validate and clean the symbol
  const cleanSymbol = props.symbol?.trim();

  if (!cleanSymbol) {
    return (
      <div className="tradingview-widget-container w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="font-medium">Invalid Symbol</p>
          <p className="text-sm">No symbol provided for chart</p>
        </div>
      </div>
    );
  }

  // Log for debugging
  console.log("AdvRTChart rendering with symbol:", cleanSymbol);

  const chartUrl = `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    cleanSymbol
  )}&interval=D&theme=light&style=1&locale=en&autosize=true`;

  return (
    <div className="tradingview-widget-container w-full h-full min-h-[400px]">
      <iframe
        title={`TradingView Chart - ${cleanSymbol}`}
        src={chartUrl}
        className="w-full h-full min-h-[400px] border-0 rounded-lg"
        style={{ minHeight: "400px" }}
        allow="fullscreen"
      />
    </div>
  );
};

export default memo(AdvRTChart);
