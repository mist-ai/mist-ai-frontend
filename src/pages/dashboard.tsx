import React, { useState, useEffect, useRef } from "react";
import SymbolOverviewChart from "../components/trading-view/symbol-overview-chart";
import AdvRTChart from "../components/trading-view/adv-real-time-chart";
import StockMarketWidget from "@/components/trading-view/stock-market-widget";
import TickersSlider from "@/components/trading-view/tickers-slider";
import MarketData from "@/components/trading-view/market-data";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Ticker,
  TickersSliderWidgetProps,
  TradingViewWidget,
  TradingViewWidgetComonent,
  TradingViewWidgetType,
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
    let widgetObject: TradingViewWidgetComonent | null = null;
    switch (widget.widget) {
      case TradingViewWidgetType.SymbolOverviewChart:
        widgetObject = {
          id: widget.id,
          component: <SymbolOverviewChart symbols={widget.props} />,
        };
        break;
      case TradingViewWidgetType.AdvRTChart:
        widgetObject = {
          id: widget.id,
          component: <AdvRTChart symbol={widget.props} />,
        };
        break;
      case TradingViewWidgetType.MarketData:
        widgetObject = {
          id: widget.id,
          component: <MarketData marketData={widget.props} />,
        };
        break;
      case TradingViewWidgetType.TickersSlider:
        setTickerSliderTickers(widget.props);
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
        console.log("Adding widgets: ", response);
        // TODO: when multisteps
        let jOutput = JSON.parse(response[1].content);
        let id = -1;
        console.log("jOutput:", jOutput);
        if (widgets.length > 0) {
          id = widgets[widgets.length - 1].id;
        }
        if (jOutput.length === 0) {
          setErrorMsg(response[0].reasoning);
        }

        for (const widget of jOutput) {
          console.log("Adding widget widget: ", jOutput);
          id++;
          widget.id = id;
          addWidget(widget);
          console.log(id, "Widget Added from submitMSg: ", widget);
          saveWidgetToLocalStorage(widget);

          // Reload the page if the widget is TickersSlider to apply the new tickers
          if (widget.widget === TradingViewWidgetType.TickersSlider) {
            window.location.reload();
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

  return (
    <div className="p-2">
      <div className="text-lg mb-4 font-semibold">MIST.ai Dashboard</div>

      {errorMsg && (
        <div className="fixed top-4 right-4 text-white z-50">
          <div className="p-4 rounded-lg shadow-lg bg-red-200 bg-opacity-90 flex items-center border border-red-500">
            <span className="text-black max-w-lg">
              Failed to add widget. Please try again.
              <br />
              <b>Reasoning: </b>
              {errorMsg}
            </span>
            <button
              className="ml-4 bg-transparent border-0 text-black"
              onClick={() => setErrorMsg(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {loadState && (
        <div className="fixed inset-0 bg-black opacity-60 z-40 flex items-center justify-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-green-400 h-12 w-12"></div>
        </div>
      )}

      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 px-6 rounded-full shadow-lg"
        onClick={() => setShowChat(true)}
      >
        Chat
      </button>
      {showChat && (
        <>
          <div
            className="fixed inset-0 bg-black opacity-70 z-40"
            onClick={() => setShowChat(false)}
          ></div>
          <div className="fixed bottom-24 right-8 w-1/3 bg-white shadow-lg border p-4 rounded-xl z-50">
            <div className="flex justify-between items-center mb-2"></div>
            <div className="h-full overflow-y-auto">
              <div>
                <form
                  className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
                  x-chunk="dashboard-03-chunk-1"
                  onSubmit={submitMessage}
                >
                  <Label htmlFor="message" className="sr-only">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="min-h-20 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                  />
                  <div className="flex items-center p-3 pt-0">
                    <Tooltip></Tooltip>
                    <Button type="submit" size="sm" className="ml-auto gap-1.5">
                      Add Widget
                      <CornerDownLeft className="size-3.5" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {tickerSliderTickers.length > 0 && (
        <div className="w-full mb-4">
          <TickersSlider tickers={tickerSliderTickers} />
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {widgets.map((widget) => (
          <div key={widget.id} className="relative flex">
            <button
              className="absolute top-0 right-0 px-2 rounded-full hover:bg-gray-200"
              onClick={() => removeWidget(widget.id)}
              title="Remove Widget"
            >
              &times;
            </button>
            {widget.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
