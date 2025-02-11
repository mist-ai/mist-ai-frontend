import {
  LettaMessage,
  sendMessageApiResponse,
} from "@/models/get-agent-messages-api-response";

const agentId = import.meta.env.VITE_LETTA_AGENT_ID;
const ipsAgentId = import.meta.env.VITE_LETTA_IPS_AGENT_ID;

export const fetchMessages = async (limit: number) => {
  const response = await fetch(
    `api/agents/${agentId}/messages?limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

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

export const sendMessage = async (message: string) => {
  const response = await fetch(`api/agents/${ipsAgentId}/messages`, {
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
