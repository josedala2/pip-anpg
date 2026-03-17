import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildOperators, OperatorDetailView } from "@/components/dashboard/OperatorsPanel";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";

const OperatorPage = () => {
  const { operatorName } = useParams<{ operatorName: string }>();
  const navigate = useNavigate();
  const operators = useMemo(() => buildOperators(), []);

  const decodedName = decodeURIComponent(operatorName || "");
  const operator = operators.find(op => op.name === decodedName);

  if (!operator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Operador não encontrado: {decodedName}</p>
          <button onClick={() => navigate(-1)} className="text-primary underline text-sm">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-[1920px] 3xl:max-w-[2400px] mx-auto w-full px-4 md:px-6 py-6">
        <OperatorDetailView operator={operator} onBack={() => navigate(-1)} />
      </div>
      <InstitutionalFooter />
    </div>
  );
};

export default OperatorPage;
