import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon: Icon = MessageCircle, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <Card className="shadow-card border-0 animate-fade-in">
      <CardContent className="p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 rounded-full bg-primary/10">
            <Icon className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 text-base max-w-md mx-auto">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} size="lg" className="h-12 px-8">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
