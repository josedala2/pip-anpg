import { useParams, useNavigate, Link } from "react-router-dom";
import { oilBlocks } from "@/data/angolaBlocks";
import { FacilityDetailCard } from "@/components/dashboard/FacilityDetailCard";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Home, Factory } from "lucide-react";

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
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1.5 text-xs">
                  <Home className="w-3.5 h-3.5" /> Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs">Instalações</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/block/${block.id}`} className="text-xs">{block.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-primary" />
                {decodedPlatform}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
