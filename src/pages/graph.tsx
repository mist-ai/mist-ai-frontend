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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";

const Graph = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

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
      let edgeStyle: any = {
        stroke: "#e2e8f0",
        strokeWidth: 2,
        strokeDasharray: "5,5",
      };
      let edgeType = "smoothstep";

      if (sourceNode.type === "input" && targetNode.type === "reasoning") {
        edgeStyle = {
          stroke: "#10b981",
          strokeWidth: 3,
        }; // Modern green
      } else if (
        sourceNode.type === "reasoning" &&
        targetNode.type === "output"
      ) {
        edgeStyle = {
          stroke: "#3b82f6",
          strokeWidth: 3,
        }; // Modern blue
      } else if (sourceNode.type === "output" && targetNode.type === "input") {
        edgeStyle = {
          stroke: "#f59e0b",
          strokeWidth: 3,
        }; // Modern orange
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
          width: 20,
          height: 20,
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
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            MIST.ai Graph
          </h1>
          <p className="text-slate-600 mt-1">
            Visualize your AI conversation flow
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
            User Input
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            AI Reasoning
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
            Agent Response
          </div>
        </div>
      </div>
      <div className="h-[calc(100vh-200px)] bg-white rounded-xl shadow-lg border border-slate-200">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          attributionPosition="bottom-left"
        >
          <Background
            variant={"dots" as any}
            gap={20}
            size={1}
            color="#e2e8f0"
          />
          <MiniMap
            nodeColor={nodeColor}
            nodeStrokeWidth={2}
            nodeStrokeColor="#ffffff"
            zoomable
            pannable
            style={{
              backgroundColor: "#f8fafc",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default Graph;
