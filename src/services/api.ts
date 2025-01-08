import { LettaMessage } from "@/models/get-agent-messages-api-response";

const agentId = import.meta.env.VITE_LETTA_AGENT_ID;

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
