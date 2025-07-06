import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";
import { fetchMessages } from "@/services/api";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./graph.scss";
import { useEffect, useState } from "react";

const Graph = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Helper functions for elegant node styling
  const getNodeBackground = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"; // Emerald gradient
      case "output":
        return "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"; // Indigo gradient
      case "reasoning":
        return "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"; // Amber gradient
      default:
        return "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"; // Slate gradient
    }
  };

  const getNodeBorderColor = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "#10b981";
      case "output":
        return "#6366f1";
      case "reasoning":
        return "#f59e0b";
      default:
        return "#64748b";
    }
  };

  const getNodeShadow = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "rgba(16, 185, 129, 0.15)";
      case "output":
        return "rgba(99, 102, 241, 0.15)";
      case "reasoning":
        return "rgba(245, 158, 11, 0.15)";
      default:
        return "rgba(100, 116, 139, 0.15)";
    }
  };

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
      let position = { x: 300, y: index * 180 }; // Default position with more spacing

      switch (message.message_type) {
        case MessageType.User:
          nodeType = "input";
          label = "Prompt: " + message.content;
          position = { x: 100, y: index * 180 }; // Left side for user inputs
          break;
        case MessageType.Assistant:
          nodeType = "output";
          label = "Agent: " + message.content;
          position = { x: 500, y: index * 180 }; // Right side for agent responses
          break;
        case MessageType.Reasoning:
          nodeType = "reasoning";
          label = "Reasoning: " + message.reasoning;
          position = { x: 300, y: index * 180 }; // Center for reasoning
          break;
        default:
          label = message.message_type;
          position = { x: 300, y: index * 180 }; // Center for other types
      }

      return {
        id: (message.date || index.toString()) + "_" + index,
        data: {
          label,
          message:
            (message as any).content ||
            (message as any).reasoning ||
            message.message_type,
          type: message.message_type,
          timestamp: message.date,
        },
        position,
        type: nodeType,
        style: {
          background: getNodeBackground(nodeType),
          border: `2px solid ${getNodeBorderColor(nodeType)}`,
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: `0 4px 12px ${getNodeShadow(nodeType)}`,
          color: "#1f2937",
          fontSize: "13px",
          fontWeight: "500",
          minWidth: "200px",
          maxWidth: "300px",
        },
      };
    });

    // Create edges between consecutive nodes
    const newEdges = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      const sourceNode = newNodes[i];
      const targetNode = newNodes[i + 1];

      // Determine edge style based on node types
      let edgeStyle: any = {
        stroke: "#cbd5e1",
        strokeWidth: 2,
        strokeDasharray: "8,4",
      };
      let edgeType = "smoothstep";

      if (sourceNode.type === "input" && targetNode.type === "reasoning") {
        edgeStyle = {
          stroke: "#10b981",
          strokeWidth: 3,
          strokeOpacity: 0.8,
        }; // Elegant emerald
      } else if (
        sourceNode.type === "reasoning" &&
        targetNode.type === "output"
      ) {
        edgeStyle = {
          stroke: "#6366f1",
          strokeWidth: 3,
          strokeOpacity: 0.8,
        }; // Elegant indigo
      } else if (sourceNode.type === "output" && targetNode.type === "input") {
        edgeStyle = {
          stroke: "#f59e0b",
          strokeWidth: 3,
          strokeOpacity: 0.8,
        }; // Elegant amber
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
          width: 16,
          height: 16,
        },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [messages]);

  // Focus on the latest messages when nodes are updated
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // Get the last few nodes to focus on
      const lastNodeIndex = nodes.length - 1;
      const lastNode = nodes[lastNodeIndex];

      if (lastNode) {
        // Center the view on the last node with some padding
        reactFlowInstance.setCenter(lastNode.position.x, lastNode.position.y, {
          zoom: 0.8,
          duration: 800,
        });
      }
    }
  }, [nodes, reactFlowInstance]);

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
        return "#10b981"; // Modern emerald green
      case "output":
        return "#6366f1"; // Modern indigo
      case "reasoning":
        return "#f59e0b"; // Modern amber
      default:
        return "#64748b"; // Modern slate
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MIST.ai Graph
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Visualize your AI conversation flow with elegant precision
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-sm"></div>
              User Input
            </div>
            <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2 shadow-sm"></div>
              AI Reasoning
            </div>
            <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2 shadow-sm"></div>
              Agent Response
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-250px)] bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setReactFlowInstance}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            attributionPosition="bottom-left"
            className="elegant-flow"
          >
            <Background
              variant={"dots" as any}
              gap={24}
              size={1.5}
              color="#e2e8f0"
              style={{ opacity: 0.4 }}
            />
            <Controls
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "8px",
                backdropFilter: "blur(8px)",
              }}
            />
            <MiniMap
              nodeColor={nodeColor}
              nodeStrokeWidth={0}
              nodeStrokeColor="transparent"
              zoomable
              pannable
              style={{
                background: "rgba(248, 250, 252, 0.9)",
                border: "2px solid rgba(226, 232, 240, 0.5)",
                borderRadius: "12px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default Graph;
