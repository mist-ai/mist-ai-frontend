import React, { useState, useEffect, useRef } from "react";
import SymbolOverviewChart from "../components/trading-view/symbol-overview-chart";
import AdvRTChart from "../components/trading-view/adv-real-time-chart";
import StockMarketWidget from "@/components/trading-view/stock-market-widget";
import TickersSlider from "@/components/trading-view/tickers-slider";
import MarketData from "@/components/trading-view/market-data";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Ticker,
  TickersSliderWidgetProps,
  TradingViewWidget,
  TradingViewWidgetComonent,
  TradingViewWidgetType,
  WidgetSize,
  AdvRTChartProps,
  MarketDataGroup,
  MarketDataList,
  SymbolOverviewChartProps,
} from "@/models/trading-view-widgets";
import { sendMessage } from "@/services/api";
import {
  getWidgetsFromLocalStorage,
  removeWidgetFromLocalStorage,
  saveWidgetToLocalStorage,
} from "@/services/local-storage";

const Dashboard: React.FC = () => {
  const [showChat, setShowChat] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<TradingViewWidgetComonent[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [tickerSliderTickers, setTickerSliderTickers] = useState<Ticker[]>([]);
  useState<TickersSliderWidgetProps>();
  const isMounted = useRef(false);
  const [loadState, setLoadState] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load widgets from local storage when the component mounts
  useEffect(() => {
    if (!isMounted.current) {
      const savedWidgets = getWidgetsFromLocalStorage();

      savedWidgets.forEach((widget: TradingViewWidget) => {
        addWidget(widget);
      });

      isMounted.current = true;
    }
  }, []);

  const addWidget = (widget: TradingViewWidget) => {
    console.log("Adding widget:", widget.widget, "with props:", widget.props);
    let widgetObject: TradingViewWidgetComonent | null = null;
    const widgetSize = getWidgetSize(widget.widget, widget.size);

    switch (widget.widget) {
      case TradingViewWidgetType.SymbolOverviewChart:
        // Ensure props match SymbolOverviewChartProps interface
        let symbols: string[][];
        if (
          Array.isArray(widget.props) &&
          widget.props.length > 0 &&
          Array.isArray(widget.props[0])
        ) {
          symbols = widget.props as unknown as string[][];
        } else if (
          typeof widget.props === "object" &&
          widget.props &&
          "symbols" in widget.props
        ) {
          symbols = (widget.props as SymbolOverviewChartProps).symbols;
        } else {
          console.error("Invalid SymbolOverviewChart props:", widget.props);
          return;
        }
        widgetObject = {
          id: widget.id,
          component: <SymbolOverviewChart symbols={symbols} />,
          size: widgetSize,
        };
        break;
      case TradingViewWidgetType.AdvRTChart:
        // Handle both direct symbol string and AdvRTChartProps interface
        let symbol: string;
        if (typeof widget.props === "string") {
          symbol = widget.props;
        } else if (
          typeof widget.props === "object" &&
          widget.props &&
          "symbol" in widget.props
        ) {
          symbol = (widget.props as AdvRTChartProps).symbol;
        } else {
          console.error("Invalid AdvRTChart props:", widget.props);
          return;
        }
        console.log("AdvRTChart symbol:", symbol);
        widgetObject = {
          id: widget.id,
          component: <AdvRTChart symbol={symbol} />,
          size: widgetSize,
        };
        break;
      case TradingViewWidgetType.MarketData:
        // Handle both direct array and MarketDataList interface
        let marketData: MarketDataGroup[];
        if (
          Array.isArray(widget.props) &&
          widget.props.length > 0 &&
          typeof widget.props[0] === "object" &&
          "name" in widget.props[0]
        ) {
          marketData = widget.props as unknown as MarketDataGroup[];
        } else if (
          typeof widget.props === "object" &&
          widget.props &&
          "marketData" in widget.props
        ) {
          marketData = (widget.props as MarketDataList).marketData;
        } else {
          console.error("Invalid MarketData props:", widget.props);
          return;
        }
        widgetObject = {
          id: widget.id,
          component: <MarketData marketData={marketData} />,
          size: widgetSize,
        };
        break;
      case TradingViewWidgetType.TickersSlider:
        // Handle ticker props
        let tickers: Ticker[];
        if (
          Array.isArray(widget.props) &&
          widget.props.length > 0 &&
          typeof widget.props[0] === "object" &&
          "proName" in widget.props[0]
        ) {
          tickers = widget.props as unknown as Ticker[];
        } else if (
          typeof widget.props === "object" &&
          widget.props &&
          "tickers" in widget.props
        ) {
          tickers = (widget.props as any).tickers;
        } else {
          console.error("Invalid TickersSlider props:", widget.props);
          return;
        }
        setTickerSliderTickers(tickers);
        break;
      default:
        console.error("Unknown widget type: ", widget.widget);
    }

    if (widgetObject) {
      setWidgets((prevWidgets: TradingViewWidgetComonent[]) => [
        ...prevWidgets,
        widgetObject,
      ]);
    }
  };

  const removeWidget = (id: number) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
    removeWidgetFromLocalStorage(id);
  };

  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowChat(false);
    setLoadState(true);

    sendMessage(inputMsg, "widget").then((response) => {
      if (response) {
        console.log("API Response:", response);

        // Find the tool return message or assistant message that contains the widget data
        let widgetData = null;
        let errorReason = null;

        for (const message of response) {
          if (
            message.message_type === "tool_return_message" &&
            "tool_return" in message
          ) {
            try {
              widgetData = JSON.parse(message.tool_return);
              console.log("Parsed widget data:", widgetData);
              break;
            } catch (e) {
              console.error("Failed to parse tool return:", e);
            }
          } else if (
            message.message_type === "assistant_message" &&
            "content" in message
          ) {
            try {
              widgetData = JSON.parse(message.content);
              console.log("Parsed assistant message data:", widgetData);
              break;
            } catch (e) {
              // Not JSON, might be regular text
              console.log("Assistant message content:", message.content);
            }
          } else if (
            message.message_type === "reasoning_message" &&
            "reasoning" in message
          ) {
            errorReason = message.reasoning;
          }
        }

        let id = widgets.length > 0 ? widgets[widgets.length - 1].id : -1;

        if (
          !widgetData ||
          (Array.isArray(widgetData) && widgetData.length === 0)
        ) {
          setErrorMsg(errorReason || "No widget data received from AI");
        } else {
          const widgetsToAdd = Array.isArray(widgetData)
            ? widgetData
            : [widgetData];

          for (const widget of widgetsToAdd) {
            console.log("Processing widget:", widget);
            id++;
            widget.id = id;
            addWidget(widget);
            console.log("Widget added with ID:", id, widget);
            saveWidgetToLocalStorage(widget);

            // Reload the page if the widget is TickersSlider to apply the new tickers
            if (widget.widget === TradingViewWidgetType.TickersSlider) {
              window.location.reload();
            }
          }
        }

        setLoadState(false);
      }
    });
    setInputMsg("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // Helper function to determine widget size based on type
  const getWidgetSize = (
    widgetType: TradingViewWidgetType,
    customSize?: WidgetSize
  ): WidgetSize => {
    if (customSize) return customSize;

    // Default sizes based on widget type
    switch (widgetType) {
      case TradingViewWidgetType.SymbolOverviewChart:
        return WidgetSize.Medium;
      case TradingViewWidgetType.AdvRTChart:
        return WidgetSize.Large;
      case TradingViewWidgetType.MarketData:
        return WidgetSize.Large;
      case TradingViewWidgetType.StockMarketWidget:
        return WidgetSize.Medium;
      case TradingViewWidgetType.TickersSlider:
        return WidgetSize.XLarge;
      default:
        return WidgetSize.Medium;
    }
  };

  // Helper function to get CSS classes for widget size
  const getWidgetSizeClasses = (size: WidgetSize): string => {
    const baseClasses = "col-span-1";
    const sizeClasses = {
      [WidgetSize.Small]: "widget-small",
      [WidgetSize.Medium]: "md:col-span-1 lg:col-span-2 widget-medium",
      [WidgetSize.Large]: "md:col-span-2 lg:col-span-3 widget-large",
      [WidgetSize.XLarge]:
        "md:col-span-2 lg:col-span-3 xl:col-span-4 widget-xlarge",
    };

    return `${baseClasses} ${sizeClasses[size]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>
        <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                MIST.ai Dashboard
              </h1>
              <p className="mt-1 sm:mt-2 text-blue-100 text-sm sm:text-lg">
                Intelligent Trading Analytics & Insights
              </p>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-blue-200">
                  Widgets Active
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {widgets.length}
                </div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-blue-400/30"></div>
              <div className="text-center sm:text-right">
                <div className="text-xs sm:text-sm text-blue-200">
                  AI Powered
                </div>
                <div className="text-xl sm:text-2xl font-bold">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Failed to add widget
                </h3>
                <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
              </div>
              <button
                className="ml-3 flex-shrink-0 hover:bg-red-100 rounded-md p-1 transition-colors"
                onClick={() => setErrorMsg(null)}
              >
                <svg
                  className="h-4 w-4 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loadState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-blue-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Creating your widget...</p>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-30 group"
        onClick={() => setShowChat(true)}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.906-1.305L3 21l1.305-5.094A9.863 9.863 0 013 12a8 8 0 018-8 8 8 0 018 8z"
          />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          AI
        </span>
      </button>
      {/* Modern Chat Interface */}
      {showChat && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowChat(false)}
          ></div>
          <div className="fixed bottom-4 left-4 right-4 sm:bottom-24 sm:left-auto sm:right-6 sm:w-96 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl z-50 animate-in slide-in-from-right duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Add New Widget
                </h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={submitMessage} className="space-y-4">
                <div className="relative">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Describe the widget you want to add
                  </Label>
                  <Textarea
                    id="message"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Show Apple stock price chart, Add cryptocurrency market data..."
                    className="min-h-20 resize-none border-gray-200 rounded-xl p-4 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl py-3 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Widget
                </Button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Ticker Slider Section */}
      {tickerSliderTickers.length > 0 && (
        <div className="px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-gray-100">
          <TickersSlider tickers={tickerSliderTickers} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        {widgets.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Start building your personalized trading dashboard by adding your
              first widget using the AI chat.
            </p>
            <button
              onClick={() => setShowChat(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-blue-200 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] ${getWidgetSizeClasses(
                  widget.size
                )}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center space-x-2">
                  {/* Size indicator */}
                  <div className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        widget.size === WidgetSize.Small
                          ? "bg-green-100 text-green-800"
                          : widget.size === WidgetSize.Medium
                          ? "bg-blue-100 text-blue-800"
                          : widget.size === WidgetSize.Large
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {widget.size === WidgetSize.Small
                        ? "S"
                        : widget.size === WidgetSize.Medium
                        ? "M"
                        : widget.size === WidgetSize.Large
                        ? "L"
                        : "XL"}
                    </span>
                  </div>
                  {/* Remove button */}
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 shadow-lg hover:shadow-xl"
                    onClick={() => removeWidget(widget.id)}
                    title="Remove Widget"
                  >
                    <svg
                      className="h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="relative z-0 h-full">
                  <div className="p-1 h-full flex flex-col">
                    <div className="flex-1 min-h-0">{widget.component}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
