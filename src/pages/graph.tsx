import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";
import { fetchMessages } from "@/services/api";
import { ReactFlow, Controls, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

const Graph = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const [nodes, setNodes] = useState([]);

  // const edges = [{ id: "1-2", source: "1", target: "2", animated: true }];

  useEffect(() => {
    fetchMessages(55).then((data) => {
      // Filter out unnecessary messages
      const filteredData = data.filter((message) => {
        if (message.message_type === MessageType.System) {
          return false;
        }
        if (message.message_type === MessageType.User) {
          try {
            const content = JSON.parse(message.content);
            if (content.type === "heartbeat" || content.type === "login") {
              return false;
            }
          } catch {
            // If parsing fails, treat content as plain message that needs to be rendered
          }
        }
        return true;
      });

      const processedMessages = [...filteredData];
      for (let i = 1; i < processedMessages.length; i++) {
        if (processedMessages[i].message_type === MessageType.Reasoning) {
          // Swap with the previous message
          [processedMessages[i], processedMessages[i - 1]] = [
            processedMessages[i - 1],
            processedMessages[i],
          ];
        }
      }
      // Remove the first message
      processedMessages.shift();
      processedMessages.shift();

      console.log("processedMessages:", processedMessages);

      setMessages(processedMessages);
    });
  }, []);

  useEffect(() => {
    console.log("messages:", messages);
    const nodes = messages.map((message, index) => {
      let nodeType = "default";
      let label = message.message_type;

      switch (message.message_type) {
        case MessageType.User:
          nodeType = "input";
          label = "Prompt: " + message.content;
          break;
        case MessageType.Assistant:
          nodeType = "output";
          label = "Agent: " + message.content;
          break;
        case MessageType.Reasoning:
          nodeType = "reasoning";
          label = "Reasoning: " + message.reasoning;
          break;
        default:
          label = message.message_type;
      }

      return {
        id: message.date + message,
        data: { label },
        position: { x: 200, y: index * 100 },
        type: nodeType,
      };
    });

    setNodes(nodes);
  }, [messages]);

  // const nodes = [
  //   {
  //     id: "1",
  //     data: { label: "User Prompt" },
  //     position: { x: 200, y: 0 },
  //     type: "input",
  //   },
  //   {
  //     id: "2",
  //     data: { label: "IPS Agent" },
  //     position: { x: 200, y: 100 },
  //   },
  // ];

  const nodeColor = (node) => {
    switch (node.type) {
      case "input":
        return "#6ede87";
      case "output":
        return "#6865A5";
      default:
        return "#ff0072";
    }
  };

  return (
    <div className="p-2">
      <div className="text-lg mb-4 font-semibold">MIST.ai Graph</div>
      <div className="h-full">
        <ReactFlow nodes={nodes}>
          <Background />
          <MiniMap
            nodeColor={nodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default Graph;
