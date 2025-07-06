import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Book, FileText, Code, Users } from "lucide-react";

const DocumentationPage: React.FC = () => {
  const handleOpenDocs = () => {
    window.open(
      "https://mist-ai.github.io/mist-ai-docs/",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Book className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MIST.ai Documentation
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Explore our comprehensive documentation to unlock the full
              potential of MIST.ai. Learn how to leverage AI-powered financial
              insights for smarter trading decisions.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground">
                Quick setup guides and tutorials to get you up and running
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <Code className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground">
                Learn how to use features like chat, dashboard, and analytics
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join our community for support, discussions, and updates
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <Button
              onClick={handleOpenDocs}
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Book className="w-5 h-5 mr-2" />
              Visit Official Documentation
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Access comprehensive guides, API references, and examples at{" "}
              <button
                onClick={handleOpenDocs}
                className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                mist-ai.github.io/mist-ai-docs
              </button>
            </p>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our documentation is continuously updated with new features,
              examples, and best practices. Whether you're a beginner or an
              advanced user, you'll find everything you need to master MIST.ai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
