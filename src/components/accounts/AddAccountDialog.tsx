"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPreset, detectProvider } from "@/lib/email/provider-presets";

interface AddAccountDialogProps {
  onSuccess?: () => void;
}

type Step = "provider" | "credentials" | "test" | "done";

const PROVIDERS = [
  { value: "GMAIL", label: "Gmail", hint: "Use App Password (not your Google password)" },
  { value: "OUTLOOK", label: "Outlook / Hotmail", hint: "Use App Password or account password" },
  { value: "YAHOO", label: "Yahoo Mail", hint: "Use App Password" },
  { value: "ZOHO", label: "Zoho Mail", hint: "Use App-specific password" },
  { value: "CUSTOM", label: "Custom SMTP/IMAP", hint: "Enter your server details manually" },
];

export function AddAccountDialog({ onSuccess }: AddAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("provider");
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; smtp?: { error?: string }; imap?: { error?: string } } | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    displayName: "",
    provider: "GMAIL",
    smtp: { host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "" },
    imap: { host: "imap.gmail.com", port: 993, secure: true, user: "", password: "" },
  });

  function handleProviderChange(provider: string) {
    const preset = getPreset(provider);
    setForm((f) => ({
      ...f,
      provider,
      smtp: { ...preset.smtp, user: f.smtp.user || f.email, password: f.smtp.password },
      imap: { ...preset.imap, user: f.imap.user || f.email, password: f.imap.password },
    }));
  }

  function handleEmailChange(email: string) {
    const provider = detectProvider(email);
    const preset = getPreset(provider);
    setForm((f) => ({
      ...f,
      email,
      provider,
      smtp: { ...preset.smtp, user: email, password: f.smtp.password },
      imap: { ...preset.imap, user: email, password: f.imap.password },
    }));
  }

  async function handleSaveAndTest() {
    if (!form.email || !form.smtp.password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);

    // Create account
    const createRes = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      toast.error(err.error || "Failed to create account");
      setLoading(false);
      return;
    }

    const { account } = await createRes.json();
    setCreatedId(account.id);

    // Test connection
    setStep("test");
    const testRes = await fetch(`/api/accounts/${account.id}/test`, { method: "POST" });
    const result = await testRes.json();
    setTestResult(result);
    setLoading(false);

    if (result.success) {
      setStep("done");
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStep("provider");
      setTestResult(null);
      setCreatedId(null);
      setLoading(false);
      setForm({
        email: "",
        displayName: "",
        provider: "GMAIL",
        smtp: { host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "" },
        imap: { host: "imap.gmail.com", port: 993, secure: true, user: "", password: "" },
      });
    }, 300);
    if (testResult?.success || step === "done") onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "provider" && "Select Email Provider"}
            {step === "credentials" && "Enter Credentials"}
            {step === "test" && "Testing Connection..."}
            {step === "done" && "Account Connected!"}
          </DialogTitle>
        </DialogHeader>

        {/* Provider selection + credentials (combined) */}
        {(step === "provider" || step === "credentials") && (
          <div className="space-y-4">
            <div>
              <Label>Email Provider</Label>
              <Select value={form.provider} onValueChange={handleProviderChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {PROVIDERS.find((p) => p.value === form.provider)?.hint}
              </p>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input
                className="mt-1"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
            </div>

            <div>
              <Label>Password / App Password</Label>
              <Input
                className="mt-1"
                type="password"
                placeholder="Your app password"
                value={form.smtp.password}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  smtp: { ...f.smtp, password: e.target.value },
                  imap: { ...f.imap, password: e.target.value },
                }))}
              />
            </div>

            {form.provider === "CUSTOM" && (
              <>
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold">SMTP Settings</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Host</Label>
                      <Input
                        className="mt-1 h-8"
                        value={form.smtp.host}
                        onChange={(e) => setForm((f) => ({ ...f, smtp: { ...f.smtp, host: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Port</Label>
                      <Input
                        className="mt-1 h-8"
                        type="number"
                        value={form.smtp.port}
                        onChange={(e) => setForm((f) => ({ ...f, smtp: { ...f.smtp, port: Number(e.target.value) } }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold">IMAP Settings</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Host</Label>
                      <Input
                        className="mt-1 h-8"
                        value={form.imap.host}
                        onChange={(e) => setForm((f) => ({ ...f, imap: { ...f.imap, host: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Port</Label>
                      <Input
                        className="mt-1 h-8"
                        type="number"
                        value={form.imap.port}
                        onChange={(e) => setForm((f) => ({ ...f, imap: { ...f.imap, port: Number(e.target.value) } }))}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={handleSaveAndTest} disabled={loading} className="flex-1">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save & Test Connection
              </Button>
            </div>
          </div>
        )}

        {/* Testing */}
        {step === "test" && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-brand-navy" />
            <p className="text-muted-foreground">Testing SMTP and IMAP connection...</p>
          </div>
        )}

        {/* Test result */}
        {step === "test" && testResult && !testResult.success && (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-600/30 bg-red-600/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="font-semibold text-red-400">Connection Failed</span>
              </div>
              {testResult.smtp?.error && <p className="text-sm text-muted-foreground">SMTP: {testResult.smtp.error}</p>}
              {testResult.imap?.error && <p className="text-sm text-muted-foreground">IMAP: {testResult.imap.error}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
              <Button onClick={() => setStep("credentials")} className="flex-1">Fix Settings</Button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
            <div>
              <h3 className="font-bold text-lg">Connection Successful!</h3>
              <p className="text-muted-foreground text-sm">{form.email} is ready for warm-up.</p>
            </div>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
