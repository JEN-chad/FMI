"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Handshake, MessageSquare, FileText, CheckSquare, CreditCard,
  ChevronRight, ArrowLeft, Loader2, Send, CheckCircle2, ShieldAlert,
  Download, Upload, Eye, File, Trash2, Clock, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMessages, ChatMessage } from "@/hooks/use-messages";
import { signAgreementAction, updateChecklistItemAction, uploadDealDocumentAction } from "@/actions/deals";
import { toast } from "sonner";
import { DealStage, EscrowStatus, DealDocumentType, Visibility } from "@prisma/client";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  assignedTo: string;
  isCompleted: boolean;
  completedAt: Date | null;
}

interface Deal {
  id: string;
  stage: DealStage;
  dealValue: unknown;
  escrowStatus: EscrowStatus;
  escrowReference: string | null;
  buyerSigned: boolean;
  sellerSigned: boolean;
  signedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  listing: { id: string; title: string; slug: string; askingPrice: unknown };
  buyer: { id: string; name: string; email: string; avatarUrl: string | null };
  seller: { id: string; name: string; email: string; avatarUrl: string | null };
  checklistItems: ChecklistItem[];
  documents: Document[];
}

interface Props {
  deal: Deal;
  role: "BUYER" | "SELLER";
  currentUserId: string;
  initialMessages: ChatMessage[];
}

const STAGES: { stage: DealStage; label: string; desc: string }[] = [
  { stage: DealStage.NDA, label: "NDA", desc: "Confidentiality agreed" },
  { stage: DealStage.DUE_DILIGENCE, label: "Due Diligence", desc: "Verify business details" },
  { stage: DealStage.AGREEMENT, label: "Agreement", desc: "Purchase terms review" },
  { stage: DealStage.ESCROW, label: "Escrow", desc: "Secure fund transfer" },
  { stage: DealStage.TRANSFER, label: "Handover", desc: "Asset & account transfer" },
  { stage: DealStage.CLOSED, label: "Closed", desc: "Acquisition completed" },
];

function formatCurrency(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(0)}K`;
}

// ─── Main Deal Room ──────────────────────────────────────────────────────────

export function DealRoomContainer({ deal: initialDeal, role, currentUserId, initialMessages }: Props) {
  const [deal, setDeal] = useState(initialDeal);
  const [activeTab, setActiveTab] = useState("checklist");
  const [isPending, startTransition] = useTransition();

  // Realtime Chat Hook
  const { messages, isSending, sendMessage, markRead } = useMessages({
    dealId: deal.id,
    currentUserId,
    initialMessages,
  });

  // Mark messages read when opening chat tab
  useEffect(() => {
    if (activeTab === "chat") {
      markRead();
    }
  }, [activeTab, markRead]);

  // Chat message input
  const [msgInput, setMsgInput] = useState("");

  const currentStageIndex = STAGES.findIndex((s) => s.stage === deal.stage);
  const percentage = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  const otherParty = role === "BUYER" ? deal.seller : deal.buyer;

  // Checklist handler
  function handleToggleChecklist(itemId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      const result = await updateChecklistItemAction(deal.id, itemId, nextStatus);
      if (result.success) {
        setDeal((prev) => ({
          ...prev,
          checklistItems: prev.checklistItems.map((item) =>
            item.id === itemId
              ? { ...item, isCompleted: nextStatus, completedAt: nextStatus ? new Date() : null }
              : item
          ),
        }));
        toast.success(`Checklist item updated!`);
      } else {
        toast.error(result.error);
      }
    });
  }

  // Document Upload State
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<DealDocumentType>(DealDocumentType.OTHER);

  function handleUploadDoc() {
    if (!docUrl || !docName) {
      toast.error("Please fill in document name and upload file.");
      return;
    }

    startTransition(async () => {
      const result = await uploadDealDocumentAction(deal.id, {
        name: docName,
        url: docUrl,
        type: docType,
        visibility: Visibility.BOTH,
      });

      if (result.success) {
        const newDoc = {
          id: result.data.id,
          name: docName,
          url: docUrl,
          type: docType,
          createdAt: new Date(),
        };
        setDeal((prev) => ({
          ...prev,
          documents: [newDoc, ...prev.documents],
        }));
        setDocUrl(null);
        setDocName("");
        toast.success("Document uploaded to vault!");
      } else {
        toast.error(result.error);
      }
    });
  }

  // Agreement Sign
  function handleSignAgreement() {
    startTransition(async () => {
      const result = await signAgreementAction(deal.id);
      if (result.success) {
        setDeal((prev) => ({
          ...prev,
          buyerSigned: role === "BUYER" ? true : prev.buyerSigned,
          sellerSigned: role === "SELLER" ? true : prev.sellerSigned,
        }));
        toast.success("Agreement signed digitally!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-border/60">
        <div className="space-y-1.5 flex items-start gap-2">
          <Link href={role === "BUYER" ? "/buyer/deals" : "/seller/deals"}>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">{deal.listing.title}</h1>
            <p className="text-xs text-muted-foreground">
              Deal Room ID: <span className="font-mono font-semibold">{deal.id}</span> · Valuation: <span className="font-bold text-foreground">{formatCurrency(Number(deal.dealValue))}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 items-center pl-10 sm:pl-0 shrink-0">
          <Badge className="bg-brand text-brand-foreground border-0 py-1 px-3.5 text-[10px] font-bold tracking-wide uppercase shadow-xs">
            {STAGES[currentStageIndex]?.label} Stage
          </Badge>
          <Badge variant="secondary" className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 border border-border/30">
            {role.toLowerCase()} workspace
          </Badge>
        </div>
      </div>

      {/* Progress pipeline */}
      <Card className="border border-border/80 bg-card/65 shadow-xs">
        <CardContent className="p-6 space-y-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-muted-foreground uppercase tracking-wider">Transaction Flow</span>
            <span className="font-extrabold text-brand tracking-tight">{percentage}% Done</span>
          </div>
          <Progress value={percentage} className="h-2 rounded-full" />

          {/* Stepper bubbles */}
          <div className="grid grid-cols-6 gap-2 pt-3 overflow-x-auto pb-1 scrollbar-thin">
            {STAGES.map((s, idx) => {
              const done = idx < currentStageIndex;
              const active = idx === currentStageIndex;
              return (
                <div key={s.stage} className="text-center space-y-1.5 min-w-[80px]">
                  <div className={cn(
                    "h-7 w-7 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold transition-all shadow-xs border-2 border-transparent",
                    done && "fmi-gradient text-white",
                    active && "border-brand text-brand ring-4 ring-brand/12 bg-background",
                    idx > currentStageIndex && "bg-secondary text-muted-foreground border-border/30"
                  )}>
                    {done ? "✓" : idx + 1}
                  </div>
                  <p className={cn("text-[10px] font-bold truncate", active ? "text-foreground" : "text-muted-foreground/80")}>
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workspace columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Interactive Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full h-10 bg-secondary/50 rounded-xl p-1 border border-border/50">
              <TabsTrigger value="checklist" className="flex items-center gap-1.5 text-xs font-bold py-1.5 rounded-lg">
                <CheckSquare className="h-3.5 w-3.5" /> Checklist
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs font-bold py-1.5 rounded-lg">
                <MessageSquare className="h-3.5 w-3.5" /> Discussion
              </TabsTrigger>
              <TabsTrigger value="vault" className="flex items-center gap-1.5 text-xs font-bold py-1.5 rounded-lg">
                <FileText className="h-3.5 w-3.5" /> Document Vault
              </TabsTrigger>
              <TabsTrigger value="escrow" className="flex items-center gap-1.5 text-xs font-bold py-1.5 rounded-lg">
                <CreditCard className="h-3.5 w-3.5" /> Escrow Protect
              </TabsTrigger>
            </TabsList>

            {/* Checklist Tab */}
            <TabsContent value="checklist" className="mt-5 space-y-4">
              <Card className="border border-border/80 bg-card/65 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40 mb-3">
                  <CardTitle className="text-base font-bold text-foreground">Acquisition Tasks</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Structured checklists to safely transfer ownership records.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                  {deal.checklistItems.map((item) => {
                    const isMyTask = item.assignedTo === role;
                    return (
                      <div key={item.id} className={cn(
                        "flex items-start gap-4.5 p-4 rounded-xl border transition-all duration-200",
                        item.isCompleted ? "bg-success/5 border-success/20 shadow-xs" : "bg-card border-border hover:border-border/80"
                      )}>
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          disabled={!isMyTask || isPending}
                          onChange={() => handleToggleChecklist(item.id, item.isCompleted)}
                          className="mt-0.5 h-4.5 w-4.5 rounded border-input accent-brand cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className={cn("text-xs font-bold text-foreground leading-tight", item.isCompleted && "line-through text-muted-foreground/80")}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 pt-1">
                            <Badge variant="secondary" className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5">
                              Assigned: {item.assignedTo}
                            </Badge>
                            {item.isCompleted && item.completedAt && (
                              <span className="text-[10px] text-success font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed {formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="mt-5">
              <Card className="h-[480px] flex flex-col justify-between overflow-hidden border border-border/80 bg-card/65 shadow-xs">
                <CardHeader className="py-3 px-5 bg-secondary/35 border-b border-border/40 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-success animate-pulse" />
                      <CardTitle className="text-xs font-bold text-foreground">Encrypted Deal Discussion</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-brand border-brand/20 bg-brand/5 px-2 py-0.5">
                      SSL Gated
                    </Badge>
                  </div>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-secondary/10">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-muted-foreground font-medium">
                      No messages yet. Send a query to the other party to align exit terms.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUserId;
                      return (
                        <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                          <Avatar className="h-8 w-8 shrink-0 mt-0.5 shadow-xs">
                            <AvatarFallback className="text-[10px] font-extrabold fmi-gradient text-white">
                              {msg.sender.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className={cn(
                              "rounded-2xl px-4 py-2.5 text-xs leading-relaxed border shadow-xs",
                              isMe ? "bg-brand border-brand text-brand-foreground" : "bg-card border-border text-foreground"
                            )}>
                              {msg.content}
                            </div>
                            <p className="text-[9px] text-muted-foreground/60 px-1 font-semibold text-right">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 px-5 border-t border-border/40 bg-card shrink-0 flex gap-2.5 items-center">
                  <Input
                    placeholder="Type a secure message..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && msgInput.trim()) {
                        sendMessage(msgInput);
                        setMsgInput("");
                      }
                    }}
                    className="text-xs h-9 bg-secondary/35 shadow-xs"
                  />
                  <Button
                    size="sm"
                    className="h-9 px-4 shadow-xs shrink-0"
                    disabled={isSending || !msgInput.trim()}
                    onClick={() => {
                      sendMessage(msgInput);
                      setMsgInput("");
                    }}
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    <span>Send</span>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Vault Tab */}
            <TabsContent value="vault" className="mt-5 space-y-4">
              <Card className="border border-border/80 bg-card/65 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40 mb-3">
                  <CardTitle className="text-base font-bold text-foreground">Secure Vault</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Secure depository for proof of funds, signed contracts, and compliance forms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 px-6 pb-6 pt-0">
                  {/* Upload Form */}
                  <div className="p-5 rounded-2xl border border-border/80 bg-secondary/30 space-y-4">
                    <h3 className="text-xs font-bold text-foreground tracking-tight">Upload New Compliance File</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="docName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Document Name</Label>
                        <Input
                          id="docName"
                          placeholder="e.g. Verified Proof of Funds"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="h-9 text-xs bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="docType" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">File Class</Label>
                        <select
                          id="docType"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DealDocumentType)}
                          className="w-full px-3 h-9 bg-background border border-input rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring font-medium shadow-xs"
                        >
                          <option value={DealDocumentType.PROOF_OF_FUNDS}>Proof of Funds (Acquirer)</option>
                          <option value={DealDocumentType.AGREEMENT}>Asset Purchase Agreement (APA)</option>
                          <option value={DealDocumentType.TRANSFER_PROOF}>Handover/Asset Receipts</option>
                          <option value={DealDocumentType.NDA}>Signed NDA</option>
                          <option value={DealDocumentType.OTHER}>Other Supplementary Docs</option>
                        </select>
                      </div>
                    </div>

                    <FileDropzone
                      label="Upload file PDF, JPG, PNG (Max 10MB)"
                      value={docUrl}
                      onChange={setDocUrl}
                    />

                    <Button
                      size="sm"
                      className="w-full h-9 shadow-xs"
                      disabled={isPending || !docUrl || !docName}
                      onClick={handleUploadDoc}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Add File to Secure Vault
                    </Button>
                  </div>

                  <Separator className="opacity-60" />

                  {/* Documents List */}
                  <div className="space-y-2">
                    {deal.documents.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6 font-medium">No documents uploaded to vault yet.</p>
                    ) : (
                      deal.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/45 hover:border-brand/40 hover:shadow-xs transition-all">
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <File className="h-4.5 w-4.5 text-brand shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{doc.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                                {doc.type.toLowerCase().replace("_", " ")}
                              </p>
                            </div>
                          </div>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-brand hover:bg-secondary">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Escrow & Signing Tab */}
            <TabsContent value="escrow" className="mt-5 space-y-4">
              <Card className="border border-border/80 bg-card/65 shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40 mb-3">
                  <CardTitle className="text-base font-bold text-foreground">Escrow Account & Legals</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">Verify buyer deposits and sign legal transfer agreements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6 pt-0">
                  {/* Escrow Status Box */}
                  <div className="p-4 rounded-xl border border-border bg-secondary/35 space-y-3.5">
                    <h3 className="text-xs font-bold text-foreground tracking-tight">Escrow Ledger Status</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">Ledger status:</span>
                      <Badge className={cn(
                        "text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 shadow-xs border-0",
                        deal.escrowStatus === EscrowStatus.FUNDED && "bg-success text-white",
                        deal.escrowStatus === EscrowStatus.PENDING && "bg-warning text-white",
                        deal.escrowStatus === EscrowStatus.RELEASED && "bg-info text-white",
                        deal.escrowStatus === EscrowStatus.NOT_CREATED && "bg-secondary text-muted-foreground border border-border/40"
                      )}>
                        {deal.escrowStatus.replace("_", " ")}
                      </Badge>
                    </div>

                    {deal.escrowReference && (
                      <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2.5">
                        <span className="text-muted-foreground font-medium">Virtual Account Reference:</span>
                        <span className="font-mono text-foreground font-semibold">{deal.escrowReference}</span>
                      </div>
                    )}

                    {role === "BUYER" && deal.escrowStatus === EscrowStatus.NOT_CREATED && (
                      <Alert className="bg-brand/5 border border-brand/20 mt-3 p-3.5">
                        <ShieldAlert className="h-4.5 w-4.5 text-brand" />
                        <AlertTitle className="text-xs text-brand font-bold">Action Required</AlertTitle>
                        <AlertDescription className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          Please fund the virtual escrow ledger. FMI keeps these funds locked until the digital handover documents are verified.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator className="opacity-60" />

                  {/* Digital Purchase Agreement Signings */}
                  <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      ⚖️ Digital Asset Purchase Agreement
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acquirer Signed</p>
                        <p className={cn("text-xs font-bold", deal.buyerSigned ? "text-success" : "text-muted-foreground")}>
                          {deal.buyerSigned ? "Executed ✓" : "Pending"}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Founder Signed</p>
                        <p className={cn("text-xs font-bold", deal.sellerSigned ? "text-success" : "text-muted-foreground")}>
                          {deal.sellerSigned ? "Executed ✓" : "Pending"}
                        </p>
                      </div>
                    </div>

                    {((role === "BUYER" && !deal.buyerSigned) || (role === "SELLER" && !deal.sellerSigned)) ? (
                      <Button
                        className="w-full h-10 shadow-xs mt-1"
                        disabled={isPending}
                        onClick={handleSignAgreement}
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                        Digitally Execute Purchase Contract
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-xs text-success font-bold py-2 bg-success/5 border border-success/15 rounded-lg mt-1 shadow-xs">
                        <CheckCircle2 className="h-4 w-4" /> You have executed this agreement.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Transaction Details */}
        <div className="space-y-6">
          <Card className="border border-border/80 bg-card/65 shadow-md">
            <CardHeader className="pb-4 border-b border-border/40 mb-3">
              <CardTitle className="text-base font-bold text-foreground tracking-tight">Deal summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-6 pb-6 pt-0">
              {/* Other party avatar */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParty.avatarUrl ?? undefined} />
                  <AvatarFallback className="font-extrabold fmi-gradient text-white text-xs">
                    {otherParty.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{role === "BUYER" ? "Founder" : "Acquirer"}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{otherParty.name}</p>
                </div>
              </div>

              <Separator className="opacity-60" />

              {/* Pricing terms */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-muted-foreground">Original Asking Price</span>
                  <span className="text-foreground">{formatCurrency(Number(listingAskingPrice(deal)))}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Agreed Exit Value</span>
                  <span className="font-extrabold text-success text-sm">{formatCurrency(Number(deal.dealValue))}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Deal Stage</span>
                  <span className="font-bold text-brand uppercase text-[10px] tracking-wide bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-full">
                    {deal.stage.replace("_", " ")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helpers
function listingAskingPrice(deal: Deal) {
  return typeof deal.listing.askingPrice === "number" ? deal.listing.askingPrice : 0;
}
