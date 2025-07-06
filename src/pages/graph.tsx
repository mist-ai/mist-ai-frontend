import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";
import { fetchMessages } from "@/services/api";
import { ReactFlow, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

const Graph = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

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
      // for (let i = 1; i < processedMessages.length; i++) {
      //   if (processedMessages[i].message_type === MessageType.Reasoning) {
      //     // Swap with the previous message
      //     [processedMessages[i], processedMessages[i - 1]] = [
      //       processedMessages[i - 1],
      //       processedMessages[i],
      //     ];
      //   }
      // }
      // Remove the first message
      processedMessages.shift();
      processedMessages.shift();

      console.log("processedMessages:", processedMessages);

      setMessages(processedMessages);
    });
  }, []);

  useEffect(() => {
    console.log("messages:", messages);
    const newNodes = messages.map((message, index) => {
      let nodeType = "default";
      let label: string = message.message_type;
      let position = { x: 250, y: index * 150 }; // Default position

      switch (message.message_type) {
        case MessageType.User:
          nodeType = "input";
          label = "Prompt: " + message.content;
          position = { x: 50, y: index * 150 }; // Left side for user inputs
          break;
        case MessageType.Assistant:
          nodeType = "output";
          label = "Agent: " + message.content;
          position = { x: 450, y: index * 150 }; // Right side for agent responses
          break;
        case MessageType.Reasoning:
          nodeType = "reasoning";
          label = "Reasoning: " + message.reasoning;
          position = { x: 250, y: index * 150 }; // Center for reasoning
          break;
        default:
          label = message.message_type;
          position = { x: 250, y: index * 150 }; // Center for other types
      }

      return {
        id: (message.date || index.toString()) + "_" + index,
        data: { label },
        position,
        type: nodeType,
      };
    });

    // Create edges between consecutive nodes
    const newEdges = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      const sourceNode = newNodes[i];
      const targetNode = newNodes[i + 1];

      // Determine edge style based on node types
      let edgeStyle = { stroke: "#6b7280", strokeWidth: 2 };
      let edgeType = "default";

      if (sourceNode.type === "input" && targetNode.type === "reasoning") {
        edgeStyle = { stroke: "#10b981", strokeWidth: 2 }; // Green for user to reasoning
      } else if (
        sourceNode.type === "reasoning" &&
        targetNode.type === "output"
      ) {
        edgeStyle = { stroke: "#3b82f6", strokeWidth: 2 }; // Blue for reasoning to agent
      } else if (sourceNode.type === "output" && targetNode.type === "input") {
        edgeStyle = { stroke: "#f59e0b", strokeWidth: 2 }; // Orange for agent to next user input
      }

      newEdges.push({
        id: `edge-${i}`,
        source: sourceNode.id,
        target: targetNode.id,
        animated: true,
        style: edgeStyle,
        type: edgeType,
        markerEnd: {
          type: "arrowclosed",
          color: edgeStyle.stroke,
        },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
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

  const nodeColor = (node: any) => {
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
        <ReactFlow nodes={nodes} edges={edges}>
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
