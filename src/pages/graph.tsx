import {
  LettaMessage,
  MessageType,
} from "@/models/get-agent-messages-api-response";
import { fetchMessages } from "@/services/api";
import { ReactFlow, Background, MiniMap, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./graph.scss";
import { useEffect, useState } from "react";
import { labelExtractor } from "@/services/other";

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

  // Helper function to generate nodes and edges from messages (including inner tool messages)
  const generateGraphData = async (messages: LettaMessage[]) => {
    let tool: string | null = null;
    const lastMsgs = messages.slice(-30);
    const nodes = [];
    let nodeCount = 0;

    for (let i = 0; i < lastMsgs.length; i++) {
      const message = lastMsgs[i];
      let nodeType = "default";
      let label: string = message.message_type;
      nodeCount++;
      let style = {};

      // Get message content based on type
      const getMessageContent = (msg: LettaMessage) => {
        switch (msg.message_type) {
          case MessageType.User:
            return (msg as any).content;
          case MessageType.Assistant:
            return (msg as any).content;
          case MessageType.Reasoning:
            return (msg as any).reasoning;
          case MessageType.ToolReturn:
            return (msg as any).tool_return;
          default:
            return msg.message_type;
        }
      };

      switch (message.message_type) {
        case MessageType.User:
          nodeType = "input";
          label = labelExtractor(message);
          style = { borderRadius: "30px" };
          tool = null;
          break;
        case MessageType.Assistant:
          nodeType = "output";
          label = labelExtractor(message);
          tool = null;
          break;
        case MessageType.Reasoning:
          nodeType = "reasoning";
          label = labelExtractor(message);
          tool = null;
          break;
        case MessageType.ToolCall:
          nodeType = "default";
          label = labelExtractor(message);
          tool = (message as any).tool_call?.name || null;
          break;
        default:
          label = labelExtractor(message);
      }

      nodes.push({
        id: nodeCount.toString(),
        data: {
          label,
          message: getMessageContent(message),
          type: message.message_type,
          timestamp: message.date,
        },
        position: { x: 100, y: i * 180 },
        type: nodeType,
        style: {
          ...style,
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
      });

      const checkDate = message.date ? new Date(message.date).getTime() : 0;
      let count: number = 0;

      // Fetch and include inner tool messages
      if (tool) {
        try {
          const toolMessages = await fetchMessages(10, tool);

          // Reorder reasoning messages to come before other messages
          for (let j = 1; j < toolMessages.length; j++) {
            if (toolMessages[j].message_type === MessageType.Reasoning) {
              [toolMessages[j], toolMessages[j - 1]] = [
                toolMessages[j - 1],
                toolMessages[j],
              ];
            }
          }

          toolMessages.forEach((toolMessage) => {
            const toolMessageDate = toolMessage.date
              ? new Date(toolMessage.date).getTime()
              : 0;
            if (toolMessageDate >= checkDate) {
              count++;
              nodeCount++;

              let toolNodeType = "default";
              if (toolMessage.message_type === MessageType.Reasoning) {
                toolNodeType = "reasoning";
              } else if (toolMessage.message_type === MessageType.ToolReturn) {
                toolNodeType = "output";
              }

              nodes.push({
                id: nodeCount.toString(),
                data: {
                  label: labelExtractor(toolMessage, true),
                  message: getMessageContent(toolMessage),
                  type: toolMessage.message_type,
                  timestamp: toolMessage.date,
                },
                position: { x: 100 + count * 220, y: i * 180 },
                type: toolNodeType,
                style: {
                  background:
                    toolNodeType === "reasoning"
                      ? getNodeBackground("reasoning")
                      : toolNodeType === "output"
                      ? getNodeBackground("output")
                      : "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)",
                  border:
                    toolNodeType === "reasoning"
                      ? `2px solid ${getNodeBorderColor("reasoning")}`
                      : toolNodeType === "output"
                      ? `2px solid ${getNodeBorderColor("output")}`
                      : "2px solid #0ea5e9",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  boxShadow:
                    toolNodeType === "reasoning"
                      ? `0 4px 12px ${getNodeShadow("reasoning")}`
                      : toolNodeType === "output"
                      ? `0 4px 12px ${getNodeShadow("output")}`
                      : "0 4px 12px rgba(14, 165, 233, 0.15)",
                  color: "#1f2937",
                  fontSize: "13px",
                  fontWeight: "500",
                  minWidth: "200px",
                  maxWidth: "300px",
                },
              });
            }
          });
        } catch (error) {
          console.error("Error fetching tool messages:", error);
        }
        tool = null;
      }
    }

    // Create edges between consecutive nodes
    const edges = [];
    for (let i = 1; i < nodeCount; i++) {
      const sourceNode = nodes.find((n) => n.id === i.toString());
      const targetNode = nodes.find((n) => n.id === (i + 1).toString());

      if (sourceNode && targetNode) {
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
          };
        } else if (
          sourceNode.type === "reasoning" &&
          targetNode.type === "output"
        ) {
          edgeStyle = {
            stroke: "#6366f1",
            strokeWidth: 3,
            strokeOpacity: 0.8,
          };
        } else if (
          sourceNode.type === "output" &&
          targetNode.type === "input"
        ) {
          edgeStyle = {
            stroke: "#f59e0b",
            strokeWidth: 3,
            strokeOpacity: 0.8,
          };
        } else {
          edgeStyle = {
            stroke: "#6366f1",
            strokeWidth: 2,
            strokeOpacity: 0.6,
          };
        }

        edges.push({
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
    }

    return { nodes, edges };
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

      console.log("processedMessages:", processedMessages);

      setMessages(processedMessages);
    });
  }, []);

  // Update graph when messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Updating graph with messages:", messages.length);
      generateGraphData(messages).then(({ nodes, edges }) => {
        console.log("Generated nodes:", nodes.length, "edges:", edges.length);
        setNodes(nodes);
        setEdges(edges);
      });
    }
  }, [messages]);

  // Focus on the latest messages when nodes are updated
  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      // First, fit all nodes in view to show the complete graph
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.1,
          maxZoom: 1.0,
          minZoom: 0.2,
          duration: 800,
        });
      }, 100);

      // Then, after a delay, focus on the end of the graph (latest messages)
      setTimeout(() => {
        // Find the bottom-most nodes (latest in the conversation flow)
        const maxY = Math.max(...nodes.map((node) => node.position.y));

        // Find nodes that are at or near the bottom-most position (end of conversation)
        const endNodes = nodes.filter((node) => node.position.y >= maxY - 180); // Within one row height

        if (endNodes.length > 0) {
          // Calculate center of the end nodes, but focus more on the rightmost ones if there are tool messages
          const maxX = Math.max(...endNodes.map((node) => node.position.x));
          const endNodesWithTools = endNodes.filter(
            (node) => node.position.x >= maxX - 100
          );

          const targetNodes =
            endNodesWithTools.length > 0 ? endNodesWithTools : endNodes;

          const centerX =
            targetNodes.reduce((sum, node) => sum + node.position.x, 0) /
              targetNodes.length +
            150; // Add offset for better view
          const centerY =
            targetNodes.reduce((sum, node) => sum + node.position.y, 0) /
            targetNodes.length;

          // Animate to focus on the end nodes with a good zoom level
          reactFlowInstance.setCenter(centerX, centerY, {
            zoom: 0.8,
            duration: 900,
          });
        }
      }, 1500); // Wait 1.5 seconds after the initial fit view
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
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MIST.ai Graph
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Visualize the AI conversation flow to understand
              <br />
              how your AI agents interact and reason.
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
            <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200">
              <div className="w-3 h-3 rounded-full bg-sky-500 mr-2 shadow-sm"></div>
              Tool Messages
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-180px)] bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setReactFlowInstance}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            attributionPosition="bottom-left"
            className="elegant-flow"
            fitView={true}
            fitViewOptions={{
              padding: 0.15,
              maxZoom: 1.0,
              minZoom: 0.2,
              duration: 0, // No initial animation, we'll handle it manually
            }}
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
