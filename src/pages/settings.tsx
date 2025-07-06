import CSVReader from "@/components/csv-reader";
import { Settings, Upload, TrendingUp } from "lucide-react";

const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                MIST.ai Settings
              </h1>
              <p className="text-muted-foreground">
                Configure your trading preferences and portfolio data
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Upload Section */}
        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:border-primary/30 transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Portfolio Management
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload your current portfolio data to get personalized
                    insights
                  </p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Upload Portfolio CSV</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Import your portfolio holdings from a CSV file. The system
                    will analyze your current positions and provide AI-powered
                    insights tailored to your investment strategy.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 border border-border/30">
                    <CSVReader />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings Placeholder */}
          <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-muted-foreground">
                More Settings Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground">
                Additional configuration options will be available in future
                updates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
