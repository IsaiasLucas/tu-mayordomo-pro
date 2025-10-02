import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function AccountSwitcher() {
  const { user, profile } = useAuth();

  const currentAvatar = profile?.avatar_url;
  const currentName = profile?.display_name || user?.email?.split('@')[0] || "U";

  return (
    <Avatar className="h-10 w-10 ring-2 ring-primary/10">
      <AvatarImage src={currentAvatar || undefined} alt={currentName} />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {currentName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
