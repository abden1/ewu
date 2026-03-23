"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  name: string;
  email: string;
}

export function SettingsForm({ name, email }: SettingsFormProps) {
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Settings saved");
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          className="mt-1"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input className="mt-1 opacity-60" value={email} disabled />
        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </div>
  );
}
