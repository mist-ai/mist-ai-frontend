import { TradingViewWidget } from "@/models/trading-view-widgets";

export const saveWidgetToLocalStorage = (props: TradingViewWidget) => {
  const savedWidgets = localStorage.getItem("Widgets");
  let widgets = JSON.parse(savedWidgets || "[]");
  widgets.push(props);
  localStorage.setItem("Widgets", JSON.stringify(widgets));
};

export const getWidgetsFromLocalStorage = () => {
  const savedWidgets = localStorage.getItem("Widgets");
  return JSON.parse(savedWidgets || "[]");
};

export const removeWidgetFromLocalStorage = (id: number) => {
  const savedWidgets = localStorage.getItem("Widgets");
  let widgets = JSON.parse(savedWidgets || "[]");
  widgets = widgets.filter((widget: TradingViewWidget) => widget.id !== id);
  localStorage.setItem("Widgets", JSON.stringify(widgets));
};
