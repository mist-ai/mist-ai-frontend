import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";

export const labelExtractor = (message: LettaMessage, long?: boolean) => {
  switch (message.message_type) {
    case MessageType.Assistant:
      if (long) {
        return "Output: " + message.content.slice(0, 80) + "...";
      }
      return "Output: " + message.content.slice(0, 15) + "...";
    case MessageType.User:
      if (long) {
        return "Prompt: " + message.content.slice(0, 80) + "...";
      }
      return "Prompt: " + message.content.slice(0, 15) + "...";
    case MessageType.Reasoning:
      if (long) {
        return "Reasoning: " + message.reasoning.slice(0, 80) + "...";
      }
      return "Reasoning: " + message.reasoning.slice(0, 15) + "...";
    case MessageType.ToolCall:
      return "Tool: " + message.tool_call.name;
    case MessageType.ToolReturn:
      if (long) {
        return (
          "Tool return: " +
          JSON.parse(message.tool_return).message.slice(0, 80) +
          "..."
        );
      }
      return (
        "Tool return: " +
        JSON.parse(message.tool_return).message.slice(0, 15) +
        "..."
      );
    default:
      return message.message_type;
  }
};
