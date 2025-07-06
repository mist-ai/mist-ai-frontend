import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, Mic, Paperclip } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import ReactMarkdown from "react-markdown";
import { fetchMessages, postMessage } from "@/services/api";
import {
  LettaMessage,
  MessageType,
  UserMessage,
} from "@/models/get-agent-messages-api-response";
import "./chat.scss";
import "../pages/graph.scss";
import agentIcon from "../assets/agent.webp";
import processGif from "../assets/process1.gif";
import syncIcon from "../assets/sync.png";
import { Background, ReactFlow, MiniMap, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { labelExtractor } from "@/services/other";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [notifier, setNotifier] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState<string>("");

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Helper functions for elegant node styling
  const getNodeBackground = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)";
      case "output":
        return "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)";
      default:
        return "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)";
    }
  };

  const getNodeBorderColor = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "#10b981";
      case "output":
        return "#6366f1";
      default:
        return "#f59e0b";
    }
  };

  const getNodeShadow = (nodeType: string) => {
    switch (nodeType) {
      case "input":
        return "rgba(16, 185, 129, 0.15)";
      case "output":
        return "rgba(99, 102, 241, 0.15)";
      default:
        return "rgba(245, 158, 11, 0.15)";
    }
  };

  // Helper function to generate nodes and edges from messages
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
          nodeType = "default";
          label = labelExtractor(message);
          tool = null;
          break;
        case MessageType.ToolCall:
          nodeType = "default";
          label = labelExtractor(message);
          tool = message.tool_call.name || null;
          break;
        default:
          label = labelExtractor(message);
      }

      nodes.push({
        id: nodeCount.toString(),
        data: { label },
        position: { x: 30, y: i * 120 },
        type: nodeType,
        style: {
          ...style,
          background: getNodeBackground(nodeType),
          border: `2px solid ${getNodeBorderColor(nodeType)}`,
          borderRadius: "12px",
          padding: "8px 12px",
          boxShadow: `0 2px 8px ${getNodeShadow(nodeType)}`,
          color: "#1f2937",
          fontSize: "12px",
          fontWeight: "500",
          minWidth: "140px",
          maxWidth: "200px",
        },
      });

      const checkDate = message.date ? new Date(message.date).getTime() : 0;
      let count: number = 0;

      if (tool) {
        try {
          const toolMessages = await fetchMessages(10, tool);

          for (let i = 1; i < toolMessages.length; i++) {
            if (toolMessages[i].message_type === MessageType.Reasoning) {
              [toolMessages[i], toolMessages[i - 1]] = [
                toolMessages[i - 1],
                toolMessages[i],
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
              nodes.push({
                id: nodeCount.toString(),
                data: { label: labelExtractor(toolMessage, true) },
                position: { x: 30 + count * 170, y: i * 120 },
                type: "default",
                style: {
                  background:
                    "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)",
                  border: "2px solid #0ea5e9",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(14, 165, 233, 0.15)",
                  color: "#1f2937",
                  fontSize: "12px",
                  fontWeight: "500",
                  minWidth: "140px",
                  maxWidth: "200px",
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

    // Create edges
    const edges = [];
    for (let i = 1; i < nodeCount; i++) {
      edges.push({
        id: i.toString(),
        source: i.toString(),
        target: (i + 1).toString(),
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "#6366f1",
          strokeWidth: 2,
        },
      });
    }

    return { nodes, edges };
  };

  useEffect(() => {
    fetchMessages(55).then(async (data) => {
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
      // Get the last node to focus on
      const lastNodeIndex = nodes.length - 1;
      const lastNode = nodes[lastNodeIndex];

      if (lastNode) {
        // Center the view on the last node with some padding
        setTimeout(() => {
          reactFlowInstance.setCenter(
            lastNode.position.x,
            lastNode.position.y,
            {
              zoom: 0.8,
              duration: 800,
            }
          );
        }, 100); // Small delay to ensure nodes are rendered
      }
    }
  }, [nodes, reactFlowInstance]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderMessageContent = (message: LettaMessage) => {
    switch (message.message_type) {
      case MessageType.User:
        return <div className="msg-send-message">{message.content}</div>;

      case MessageType.Assistant:
        return (
          <ReactMarkdown className="pt-3 pb-1">{message.content}</ReactMarkdown>
        );

      case MessageType.ToolCall:
        return (
          <div className="msg-ips-call">
            <div className="flex row items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <img
                  src={agentIcon}
                  width={24}
                  alt="Agent Logo"
                  className="rounded-full"
                />
              </div>
              <span className="font-semibold text-blue-700">
                {message.tool_call.name}
              </span>
            </div>
            <div className="pl-11 text-gray-600">
              <span className="font-medium">Prompt: </span>
              <span className="text-sm">
                {JSON.parse(message.tool_call.arguments ?? "{}").prompt}
              </span>
            </div>
          </div>
        );

      case MessageType.Reasoning:
        return (
          <div className="msg-reasoning pl-4 mb-2 mt-2 text-gray-500 flex flex-row">
            <div className="bg-cyan-700 w-0.5 mr-2 pb-1"></div>
            <div className="flex flex-col pl-2">
              <div className="flex flex-row items-center gap-2">
                <img src={syncIcon} width={20} alt="Brain Logo" />
                <b>Reasoning</b>
              </div>
              <ReactMarkdown>{message.reasoning}</ReactMarkdown>
            </div>
          </div>
        );

      case MessageType.ToolReturn: {
        let toolReturnMessage = "{}";
        if (
          !(message.tool_return === undefined || message.tool_return === "None")
        ) {
          toolReturnMessage = message.tool_return;
          return (
            <div className="tool-return-container">
              {toolReturnMessage !== "None" && toolReturnMessage !== null ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-700">
                      Response
                    </span>
                  </div>
                  <ReactMarkdown className="text-gray-700">
                    {toolReturnMessage}
                  </ReactMarkdown>
                </>
              ) : (
                ""
              )}
            </div>
          );
        }
        return <></>;
      }

      default:
        return message.message_type;
    }
  };

  const submitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputContent: string = inputMsg;

    setInputMsg("");

    const inputMessage: UserMessage = {
      message_type: MessageType.User,
      content: inputContent,
    };
    setMessages((prevMessages) => [...prevMessages, inputMessage]);

    setNotifier("MIST AI agent is processing...");

    const response = await postMessage(inputContent);

    const reader = response.body?.getReader();
    if (!reader) {
      console.error("Failed to get reader from response");
      setNotifier(null);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        console.log("line: ", line);

        if (line.trim() === "data: [DONE]") {
          setNotifier(null);
          break;
        }

        if (line.startsWith("data: ")) {
          const jsonStr = line.replace("data: ", "");
          try {
            const parsedData = JSON.parse(jsonStr);
            if (parsedData.message_type === "tool_call_message") {
              // setStatus(parsedData.function_call.name + "is being called...");
              setNotifier(parsedData.tool_call.name + " is being called...");
            }
            if (parsedData.message_type === "tool_return_message") {
              // setStatus("Response received...");
              setNotifier("MIST AI agent is processing...");
            }
            if (parsedData.message_type === MessageType.Statistics) {
              continue;
            }
            console.log("parsedData: ", parsedData);
            setMessages((prevMessages) => [...prevMessages, parsedData]);
          } catch (error) {
            console.error("Failed to parse JSON:", error);
          }
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="grid flex-1 gap-6 overflow-auto p-6 lg:grid-cols-2">
        {/* Enhanced Graph Section */}
        <div className="relative flex flex-col bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-4 border-b border-slate-200/50">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Conversation Flow
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Real-time visualization of your AI interaction ({nodes.length}{" "}
              nodes, {edges.length} edges)
            </p>
          </div>
          <div className="flex-1 min-h-[400px]">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                className="elegant-flow"
                onInit={setReactFlowInstance}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                attributionPosition="bottom-left"
              >
                <Background
                  variant={"dots" as any}
                  gap={20}
                  size={1}
                  color="#e2e8f0"
                  style={{ opacity: 0.3 }}
                />
                <MiniMap
                  nodeStrokeWidth={0}
                  nodeStrokeColor="transparent"
                  zoomable
                  pannable
                  style={{
                    background: "rgba(248, 250, 252, 0.9)",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                  }}
                />
                <Controls
                  style={{
                    background: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    backdropFilter: "blur(4px)",
                  }}
                />
              </ReactFlow>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <div className="text-lg font-medium">
                    Loading conversation flow...
                  </div>
                  <div className="text-sm mt-2">
                    Graph will appear as messages load
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="relative flex max-h-[90vh] min-h-[50vh] flex-col chat-container p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="flex-1 pb-12 pr-2 overflow-auto space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`msg-outer-div msg-outer-div-${message.message_type}`}
              >
                <div className={`msg-container-${message.message_type}`}>
                  <>{renderMessageContent(message)}</>
                </div>
              </div>
            ))}
            {notifier && (
              <div className="processing-indicator">
                <div className="flex items-center gap-4">
                  <img src={processGif} width="48px" className="rounded-lg" />
                  <div className="font-medium text-orange-800">{notifier}</div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form
            className="chat-input-form relative overflow-hidden focus-within:ring-1 focus-within:ring-ring"
            x-chunk="dashboard-03-chunk-1"
            onSubmit={submitMessage}
          >
            <Label htmlFor="message" className="sr-only">
              Message
            </Label>
            <Textarea
              id="message"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="size-4" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Attach File</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Mic className="size-4" />
                    <span className="sr-only">Use Microphone</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Use Microphone</TooltipContent>
              </Tooltip>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
