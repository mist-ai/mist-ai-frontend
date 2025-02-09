import React, { useEffect, useRef, useState } from "react";
import Layout from "./layout";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Bird,
  CornerDownLeft,
  Mic,
  Paperclip,
  Rabbit,
  Settings,
  Share,
  Turtle,
} from "lucide-react";
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
import "./dashboard.scss";
import agentIcon from "../assets/agent.webp";
import processGif from "../assets/process1.gif";
import syncIcon from "../assets/sync.png";

const Dashboard: React.FC = () => {
  const [messages, setMessages] = useState<LettaMessage[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [notifier, setNotifier] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState<string>("");

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

      setMessages(processedMessages);
    });
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const renderMessageContent = (message: LettaMessage) => {
    switch (message.message_type) {
      case MessageType.User:
        return message.content;

      case MessageType.Assistant:
        return (
          <ReactMarkdown className="pt-3 pb-1">{message.content}</ReactMarkdown>
        );

      case MessageType.ToolCall:
        return (
          <div className="msg-ips-call bg-blue-50 p-2 rounded-tl-xl rounded-tr-xl">
            <div className="flex row items-center gap-2">
              <img src={agentIcon} width={30} alt="Agent Logo" />
              <b>{message.tool_call.name}: </b>
            </div>
            <div className="pl-10 text-gray-500">
              <b>prompt: </b>
              {JSON.parse(message.tool_call.arguments ?? "{}").prompt}
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
            <div className="msg-reasoning pl-12 text-gray-500 bg-blue-50 p-2 pt-0 rounded-bl-xl rounded-br-xl">
              {toolReturnMessage !== "None" && toolReturnMessage !== null ? (
                <>
                  <b>Response</b>:{" "}
                  <ReactMarkdown>{toolReturnMessage}</ReactMarkdown>
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
    <Layout>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">MIST.ai</h1>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Settings className="size-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Settings
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="model">Model</Label>
                    <Select>
                      <SelectTrigger
                        id="model"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="genesis">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Rabbit className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Genesis
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Our fastest model for general use cases.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Bird className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Explorer
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Performance and speed for efficiency.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="quantum">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Turtle className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{" "}
                                <span className="font-medium text-foreground">
                                  Quantum
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input id="temperature" type="number" placeholder="0.4" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-p">Top P</Label>
                    <Input id="top-p" type="number" placeholder="0.7" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-k">Top K</Label>
                    <Input id="top-k" type="number" placeholder="0.0" />
                  </div>
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Messages
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="system">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="You are a..." />
                  </div>
                </fieldset>
              </form>
            </DrawerContent>
          </Drawer>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <Share className="size-3.5" />
            Share
          </Button>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            <form className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Settings
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="model">Model</Label>
                  <Select>
                    <SelectTrigger
                      id="model"
                      className="items-start [&_[data-description]]:hidden"
                    >
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genesis">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Rabbit className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Neural{" "}
                              <span className="font-medium text-foreground">
                                Genesis
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Our fastest model for general use cases.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="explorer">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Bird className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Neural{" "}
                              <span className="font-medium text-foreground">
                                Explorer
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Performance and speed for efficiency.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="quantum">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Turtle className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Neural{" "}
                              <span className="font-medium text-foreground">
                                Quantum
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              The most powerful model for complex computations.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input id="temperature" type="number" placeholder="0.4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="top-p">Top P</Label>
                    <Input id="top-p" type="number" placeholder="0.7" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-k">Top K</Label>
                    <Input id="top-k" type="number" placeholder="0.0" />
                  </div>
                </div>
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Messages
                </legend>
                <div className="grid gap-3">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="system">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="You are a..."
                    className="min-h-[9.5rem]"
                  />
                </div>
              </fieldset>
            </form>
          </div>
          <div className="relative flex max-h-[90vh] min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <div className="flex-1 pb-12 pr-2 overflow-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`grid gap-2 msg-outer-div msg-outer-div-${message.message_type}`}
                >
                  <div
                    className={`grid gap-2 msg-container-${message.message_type}`}
                  >
                    <>{renderMessageContent(message)}</>
                  </div>
                </div>
              ))}
              {notifier && (
                <div
                  className="p-2 pr-6 rounded-lg ml-2 mt-4 flex-row items-center 
                inline-flex"
                >
                  {" "}
                  <img src={processGif} width="53px" />
                  <div className="pl-4"> {notifier} </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            <form
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
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
    </Layout>
  );
};

export default Dashboard;
