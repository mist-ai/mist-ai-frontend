export enum TradingViewWidgetType {
  AdvRTChart = "AdvRTChart",
  MarketData = "MarketData",
  StockMarketWidget = "StockMarketWidget",
  SymbolOverviewChart = "SymbolOverviewChart",
  TickersSlider = "TickersSlider",
}

export enum WidgetSize {
  Small = "small", // 1 column
  Medium = "medium", // 2 columns
  Large = "large", // 3 columns
  XLarge = "xlarge", // 4 columns (full width on some screens)
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
  props:
    | AdvRTChartProps
    | MarketDataList
    | SymbolOverviewChartProps
    | string
    | string[]
    | Ticker[]
    | MarketDataGroup[];
  size?: WidgetSize; // Optional size override
}

export interface TradingViewWidgetComonent {
  id: number;
  component: JSX.Element;
  size: WidgetSize;
}

/**
 * Tickers Slider Widget
 */
export interface Ticker {
  proName: string;
  title: string;
}

export interface TickersSliderWidgetProps {
  tickers: Ticker[];
}
