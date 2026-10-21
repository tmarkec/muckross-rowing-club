import { useState } from "react";
import { Download, Maximize2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Zone = {
  id: string;
  label: string;
  url: string;
  file: string;
  rules: { title: string; text: string }[];
};

const zones: Zone[] = [
  {
    id: "ross",
    label: "Ross Island/Copper mines",
    url: "/maps/ross-island-copper-mines.png",
    file: "MRC-map-ross-island-copper-mines.png",
    rules: [
      { title: "Watch for the rocks near Copper Mines", text: "Position the safety boat right next to them, in the middle of the traffic pattern." },
      { title: "Turn beyond the rocks", text: "Always clear the rocky area completely before starting your turn." },
      { title: "Approach to Ross Island (end / beach)", text: "Watch for shallow water at the other end. Stop at least 100 metres away from the shore." },
      { title: "No unsupervised lake crossings", text: "Do not cross the lake without a safety launch." },
      { title: "Yield to faster boats", text: "If a faster crew is catching up to you, move out of their line and give them clear water to pass." },
      { title: "Finish your turn before resting", text: "Keep rowing until the boat is fully turned onto the new heading. Only take your rest once the boat is straight and out of the main traffic flow." },
    ],
  },
  {
    id: "bay",
    label: "Bay/Osprey rock",
    url: "/maps/bay-osprey-rock.png",
    file: "MRC-map-bay-osprey-rock.png",
    rules: [
      { title: "Stay clear of rocks towards Ash Island", text: "Keep a safe distance from the rocks at the end of the bay." },
      { title: "Stay alert for course traffic", text: "Watch for crews using the main course as well as boats entering or leaving the warm-up area." },
      { title: "Stay close to Osprey Rock", text: "Hold your line close to Osprey Rock and pass around the safety boat." },
      { title: "Yield to faster boats", text: "If a faster crew is catching up to you, move out of their line and give them clear water to pass." },
      { title: "Finish your turn before resting", text: "Keep rowing until the boat is fully turned onto the new heading. Only take your rest once the boat is straight and out of the main traffic flow." },
    ],
  },
];

export function LakeNavigationRules() {
  const [zoomed, setZoomed] = useState<Zone | null>(null);

  return (
    <section aria-labelledby="lake-nav-heading" className="mb-8 rounded-lg border bg-background p-4 sm:p-6">
      <div className="mb-4 border-l-4 border-accent pl-3">
        <h2 id="lake-nav-heading" className="font-serif text-xl sm:text-2xl">Traffic Rules</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Official circulation patterns, safety boat positions, and navigation guidelines for water sessions on the lakes.
        </p>
      </div>

      <Tabs defaultValue={zones[0].id}>
        <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:inline-grid sm:w-auto sm:grid-cols-2">
          {zones.map((z) => (
            <TabsTrigger key={z.id} value={z.id} className="whitespace-normal data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {z.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {zones.map((z) => (
          <TabsContent key={z.id} value={z.id} className="mt-4 space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-muted">
                  <button type="button" onClick={() => setZoomed(z)} className="block w-full cursor-zoom-in" aria-label={`Open ${z.label} map full screen`}>
                    <img src={z.url} alt={`Navigation map: ${z.label}`} className="h-auto w-full max-w-full object-contain" loading="lazy" />
                  </button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 shadow-soft"
                    onClick={() => setZoomed(z)}
                    aria-label="Fullscreen / click to zoom"
                    title="Fullscreen / click to zoom"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t p-3">
                  <span className="text-xs text-muted-foreground">Tap the map to zoom</span>
                  <Button asChild size="sm" variant="outline">
                    <a href={z.url} download={z.file}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Map (PNG)
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="mb-2 text-base font-semibold">Rules for this zone</h3>
              <ul className="space-y-2">
                {z.rules.map((r) => (
                  <li key={r.title} className="flex gap-2 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span className="min-w-0"><strong>{r.title}:</strong> {r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!zoomed} onOpenChange={(o) => !o && setZoomed(null)}>
        <DialogContent className="max-h-[95vh] w-[95vw] max-w-6xl overflow-auto p-2 sm:p-4">
          <DialogTitle className="pr-8 text-base">{zoomed?.label}</DialogTitle>
          {zoomed && <img src={zoomed.url} alt={`Navigation map: ${zoomed.label}`} className="h-auto w-full" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
