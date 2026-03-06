import { RiskPerformance } from "@/components/dashboard/RiskPerformance";

const RiskPage = () => (
  <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
    <h1 className="text-2xl font-bold tracking-tight mb-6">Risk & Performance</h1>
    <RiskPerformance />
  </div>
);

export default RiskPage;
