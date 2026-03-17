import { useParams, useNavigate } from "react-router-dom";
import { oilBlocks } from "@/data/angolaBlocks";
import { FacilityDetailCard } from "@/components/dashboard/FacilityDetailCard";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FacilityPage = () => {
  const { blockId, platformName } = useParams<{ blockId: string; platformName: string }>();
  const navigate = useNavigate();

  const decodedPlatform = decodeURIComponent(platformName || "");
  const block = oilBlocks.find(b => b.id === blockId);
  const spec = block?.facilityData?.platformSpecs?.find(p => p.name === decodedPlatform);

  if (!block || !spec) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Instalação não encontrada</p>
          <button onClick={() => navigate(-1)} className="text-primary underline text-sm">Voltar</button>
        </div>
      </div>
    );
  }

  const facilityPhotos = block.facilityData?.photos || [];
  const facilityDocs = block.facilityData?.documents || [];
  const facilityMaintenance = block.facilityData?.maintenancePlan || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-[1920px] 3xl:max-w-[2400px] mx-auto w-full px-4 md:px-6 py-6 space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <FacilityDetailCard
          spec={spec}
          photos={facilityPhotos}
          documents={facilityDocs}
          maintenanceItems={facilityMaintenance}
        />
      </div>
      <InstitutionalFooter />
    </div>
  );
};

export default FacilityPage;
