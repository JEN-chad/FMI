"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, Eye, ShieldAlert, FileText, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApproveKycAction, adminRejectKycAction } from "@/actions/admin";
import { toast } from "sonner";
import { KycStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface KycProfile {
  id: string;
  panNumber: string | null;
  aadhaarLast4: string | null;
  panDocUrl: string | null;
  aadhaarDocUrl: string | null;
  selfieUrl: string | null;
  status: KycStatus;
  rejectionReason: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    phoneNumber: string | null;
    kycType: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20" },
  APPROVED: { label: "Approved", color: "bg-success/10 text-success border-success/20" },
  REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
  NOT_STARTED: { label: "Not Started", color: "bg-muted text-muted-foreground border-border" },
};

export function AdminKycReviewClient({ initialProfiles }: { initialProfiles: KycProfile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [filter, setFilter] = useState<"ALL" | KycStatus>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "ALL" ? profiles : profiles.filter((p) => p.status === filter);

  function handleApprove(id: string) {
    startTransition(async () => {
      const result = await adminApproveKycAction(id);
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: KycStatus.APPROVED } : p))
        );
        toast.success("KYC profile approved.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject(id: string) {
    const reason = prompt("Enter rejection reason (min 10 characters):");
    if (!reason || reason.length < 10) return;
    startTransition(async () => {
      const result = await adminRejectKycAction(id, { reason });
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: KycStatus.REJECTED, rejectionReason: reason } : p))
        );
        toast.success("KYC profile rejected.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex border-b border-border">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={cn(
              "px-4 py-2 text-xs font-semibold border-b-2 transition-all",
              filter === tab ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No KYC profiles found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((profile) => {
            const cfg = STATUS_CONFIG[profile.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Card key={profile.id}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{profile.user.name}</h3>
                      <p className="text-xs text-muted-foreground">{profile.user.email} · {profile.user.phoneNumber ?? "No Phone"}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                          {profile.user.kycType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          Applied {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-xs font-semibold border", cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Document links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/80">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold">PAN Card ({profile.panNumber ?? "N/A"})</p>
                      {profile.panDocUrl ? (
                        <a href={profile.panDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> View PAN Doc
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not Uploaded</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold">Aadhaar (Last 4: {profile.aadhaarLast4 ?? "N/A"})</p>
                      {profile.aadhaarDocUrl ? (
                        <a href={profile.aadhaarDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> View Aadhaar Doc
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not Uploaded</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-semibold">Selfie / Liveness Photo</p>
                      {profile.selfieUrl ? (
                        <a href={profile.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                          <User className="h-3.5 w-3.5" /> View Selfie
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not Uploaded</p>
                      )}
                    </div>
                  </div>

                  {profile.status === KycStatus.REJECTED && profile.rejectionReason && (
                    <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-xs text-destructive">
                      Rejection Reason: "{profile.rejectionReason}"
                    </div>
                  )}

                  {/* Actions */}
                  {profile.status === KycStatus.PENDING && (
                    <div className="flex gap-2 justify-end border-t border-border pt-4">
                      <Button size="sm" variant="outline" className="border-success/30 text-success hover:bg-success/5 text-xs" disabled={isPending} onClick={() => handleApprove(profile.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve KYC
                      </Button>
                      <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/5 text-xs" disabled={isPending} onClick={() => handleReject(profile.id)}>
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject / Ask Resubmit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
