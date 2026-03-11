import { Scale, User } from "lucide-react";
import { Variant_client_lawyer } from "../backend";

interface Props {
  onSelect: (role: Variant_client_lawyer) => void;
  loading?: boolean;
}

export default function RoleSelector({ onSelect, loading }: Props) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <Scale className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to LegalConnect</h2>
        <p className="text-muted-foreground mb-8">
          How do you want to use the platform?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelect(Variant_client_lawyer.client)}
            disabled={loading}
            className="border-2 border-primary rounded-xl p-6 hover:bg-primary/5 transition-colors flex flex-col items-center gap-3 cursor-pointer"
            data-ocid="role.client.button"
          >
            <User className="w-8 h-8 text-primary" />
            <span className="font-semibold">I need legal help</span>
            <span className="text-xs text-muted-foreground">
              Find and book lawyers
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelect(Variant_client_lawyer.lawyer)}
            disabled={loading}
            className="border-2 border-primary rounded-xl p-6 hover:bg-primary/5 transition-colors flex flex-col items-center gap-3 cursor-pointer"
            data-ocid="role.lawyer.button"
          >
            <Scale className="w-8 h-8 text-primary" />
            <span className="font-semibold">I am a Lawyer</span>
            <span className="text-xs text-muted-foreground">
              Join as a verified lawyer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
