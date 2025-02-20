import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";

export const labelExtractor = (message: LettaMessage) => {
  switch (message.message_type) {
    case MessageType.Assistant:
      return "Output: " + message.content.slice(0, 15) + "...";
    case MessageType.User:
      return "Prompt: " + message.content.slice(0, 15) + "...";
    case MessageType.Reasoning:
      return "Reasoning: " + message.reasoning.slice(0, 15) + "...";
    case MessageType.ToolCall:
      return "Tool: " + message.tool_call.name;
    case MessageType.ToolReturn:
      return (
        "Tool return: " +
        JSON.parse(message.tool_return).message.slice(0, 15) +
        "..."
      );
    default:
      return message.message_type;
  }
};
