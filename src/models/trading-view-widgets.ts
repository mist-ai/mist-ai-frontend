export enum TradingViewWidgetType {
  AdvRTChart = "AdvRTChart",
  MarketData = "MarketData",
  StockMarketWidget = "StockMarketWidget",
  SymbolOverviewChart = "SymbolOverviewChart",
}

export interface AdvRTChartProps {
  symbol: string;
}

export interface MarketDataGroup {
  name: string;
  originalName: string;
  symbols: { name: string; displayName: string }[];
}

export interface MarketDataList {
  marketData: MarketDataGroup[];
}

export interface SymbolOverviewChartProps {
  symbols: string[][];
}

export interface TradingViewWidget {
  id: number;
  widget: TradingViewWidgetType;
  props: AdvRTChartProps | MarketDataList | SymbolOverviewChartProps;
}

export interface TradingViewWidgetComonent {
  id: number;
  component: JSX.Element;
}
