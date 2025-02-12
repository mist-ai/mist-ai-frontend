import CSVReader from "@/components/csv-reader";

const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="text-lg m-4 font-semibold">MIST.ai Settings</div>

      <div className="pl-4">Upload your current portfolio</div>
      <div className="p-4 h-100">
        <CSVReader />
      </div>
    </div>
  );
};

export default SettingsPage;
