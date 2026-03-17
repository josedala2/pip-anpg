import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { oilBlocks } from "@/data/angolaBlocks";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const QUICK_SUGGESTIONS = [
  "Qual bloco tem a maior produção diária?",
  "Resumo económico do Bloco 0",
  "Compara a produção dos blocos 14, 15 e 17",
  "Quais blocos estão em fase de exploração?",
  "Qual o risco operacional mais elevado?",
  "Quais operadores actuam em Angola?",
  "Dados de abandono do Bloco 0",
  "Top 5 blocos por reservas estimadas",
];

function buildBlocksSummary(): string {
  return oilBlocks
    .map((b) => {
      const parts = [
        `## ${b.name}`,
        `Operador: ${b.operator} | Parceiros: ${b.partners.join(", ")}`,
        `Bacia: ${b.basin} | Fase: ${b.phase} | Profundidade: ${b.waterDepth}`,
        `Produção diária: ${b.dailyProduction.toLocaleString()} BOPD`,
        `Reservas estimadas: ${b.estimatedReserves} MMBO`,
        `Investimento acumulado: ${b.accumulatedInvestment} MMUSD | Planeado: ${b.plannedInvestment} MMUSD`,
        `Taxa execução: ${b.executionRate}% | Risco: ${b.riskScore}/10 | Compliance: ${b.complianceScore}%`,
        `Data contrato: ${b.contractDate}`,
      ];
      if (b.areaKm2) parts.push(`Área: ${b.areaKm2} km²`);
      if (b.concession?.length) {
        parts.push(`Consórcio: ${b.concession.map(c => `${c.name} ${c.share}%${c.isOperator ? " (Op)" : ""}`).join(", ")}`);
      }
      if (b.fields?.length) {
        parts.push(`Campos: ${b.fields.map(f => `${f.name} (${f.status})`).join(", ")}`);
      }
      if (b.economicData?.costHistory?.length) {
        parts.push(`Custos: ${b.economicData.costHistory.map(c => `${c.period}: CAPEX ${c.capex} / OPEX ${c.opex} MMUSD`).join("; ")}`);
      }
      if (b.economicData?.opexPerBarrel) {
        parts.push(`Opex/barril: ${b.economicData.opexPerBarrel} USD/BO (${b.economicData.opexPerBarrelYear})`);
      }
      if (b.economicVision?.npvByPeriod?.length) {
        parts.push(`NPV: ${b.economicVision.npvByPeriod.map(n => `${n.period}: GE ${n.ge} / Imp ${n.impostos} MMUSD`).join("; ")}`);
      }
      if (b.economicVision?.abandonmentDetail) {
        const a = b.economicVision.abandonmentDetail;
        parts.push(`Abandono: Total ${a.total} | Pontual ${a.pontual} | Fundeamento ${a.fundeamento} MMUSD`);
      }
      if (b.economicVision?.revenueShare?.length) {
        parts.push(`Receitas: ${b.economicVision.revenueShare.map(r => `${r.period}: GE ${r.gePercent}% / Imp ${r.impostosPercent}%${r.geMMUSD ? ` (GE ${r.geMMUSD} / Imp ${r.impostosMMUSD} MMUSD)` : ""}`).join("; ")}`);
      }
      if (b.explorationSummary) {
        const es = b.explorationSummary;
        if (es.totalWellsPesquisa) parts.push(`Poços pesquisa: ${es.totalWellsPesquisa} | Avaliação: ${es.totalWellsAvaliacao}`);
        if (es.geologicalSuccessRate) parts.push(`Taxa sucesso geológico: ${es.geologicalSuccessRate}%`);
      }
      return parts.join("\n");
    })
    .join("\n\n---\n\n");
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soba-chat`;

export function SobaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const context = useMemo(() => buildBlocksSummary(), []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          context,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        const errMsg = errData?.error || `Erro ${resp.status}`;
        toast.error(errMsg);
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error("Soba chat error:", e);
      toast.error("Falha na comunicação com o Soba. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-5xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Soba — Assistente Inteligente</h2>
          <p className="text-xs text-muted-foreground">
            Pergunte sobre produção, economia, contratos, exploração de qualquer concessão
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground"
            onClick={() => setMessages([])}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Limpar
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 pr-2 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Olá! Sou o Soba 🇦🇴</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              O seu assistente da Plataforma de Inteligência Petrolífera. Posso ajudar com informações sobre todos os blocos petrolíferos de Angola.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent/50 text-xs text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border/60"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:text-xs [&_th]:px-2 [&_td]:px-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border/60 rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 items-end border border-border/60 rounded-xl bg-card p-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte ao Soba sobre os blocos petrolíferos..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1.5 max-h-24 overflow-y-auto"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="h-8 w-8 rounded-lg shrink-0"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
