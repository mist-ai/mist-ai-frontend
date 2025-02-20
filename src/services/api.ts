import {
  LettaMessage,
  sendMessageApiResponse,
} from "@/models/get-agent-messages-api-response";

const agentId = import.meta.env.VITE_LETTA_AGENT_ID;
const ipsAgentId = import.meta.env.VITE_LETTA_IPS_AGENT_ID;
const widgetAgentId = import.meta.env.VITE_LETTA_WIDGET_AGENT_ID;
const analysisAgentId = import.meta.env.VITE_LETTA_ANALYSIS_AGENT_ID;
const newsAgentId = import.meta.env.VITE_LETTA_NEWS_AGENT_ID;
const ioAgentId = import.meta.env.VITE_LETTA_IO_AGENT_ID;

export const fetchMessages = async (
  limit: number,
  agent: string = "orchestrator"
) => {
  let id = agentId;
  switch (agent) {
    case "call_ips":
      id = ipsAgentId;
      break;
    case "call_analysis_agent":
      id = analysisAgentId;
      break;
    case "call_news_agent":
      id = newsAgentId;
      break;
    case "call_io_agent":
      id = ioAgentId;
      break;
  }
  const response = await fetch(`api/agents/${id}/messages?limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: LettaMessage[] = await response.json();
  return data;
};

export const postMessage = async (message: string) => {
  const response = await fetch(`api/agents/${agentId}/messages/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  return response;
};

export const sendMessage = async (message: string, agent: string) => {
  let agentId = ipsAgentId;
  if (agent === "widget") {
    agentId = widgetAgentId;
  }
  const response = await fetch(`api/agents/${agentId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const data: sendMessageApiResponse = await response.json();
  return data.messages;
};
