import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  User, 
  Building2, 
  Plus, 
  ChevronDown,
  LogIn,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Account {
  id: string;
  tipo: 'personal' | 'empresa';
  nome: string;
  email: string;
  avatar?: string;
}

interface AccountSwitcherProps {
  currentAccount: Account;
  savedAccounts: Account[];
  onAccountSwitch: (account: Account) => void;
  onAddAccount: () => void;
}

const AccountSwitcher = ({ 
  currentAccount, 
  savedAccounts, 
  onAccountSwitch, 
  onAddAccount 
}: AccountSwitcherProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchToEmpresa = () => {
    // Procura por conta empresa salva
    const empresaAccount = savedAccounts.find(acc => acc.tipo === 'empresa');
    
    if (empresaAccount) {
      // Tem conta empresa salva, vai para login secundário
      navigate('/login-secundario', { 
        state: { 
          accountType: 'empresa',
          accountData: empresaAccount
        }
      });
    } else {
      // Não tem conta empresa, vai para criar conta empresa
      navigate('/criar-conta-empresa');
    }
    
    setIsOpen(false);
    toast({
      title: empresaAccount ? "Redirecionando..." : "Criar conta empresa",
      description: empresaAccount 
        ? "Faça login com sua conta empresa" 
        : "Vamos criar sua conta empresarial"
    });
  };

  const handleSwitchToPessoal = () => {
    const pessoalAccount = savedAccounts.find(acc => acc.tipo === 'personal');
    
    if (pessoalAccount) {
      navigate('/login-secundario', { 
        state: { 
          accountType: 'personal',
          accountData: pessoalAccount
        }
      });
    } else {
      navigate('/ingresar');
    }
    
    setIsOpen(false);
  };

  return (
    <Card className="bg-background/80 backdrop-blur-lg border rounded-2xl shadow-card p-3">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto hover:bg-accent/10"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-primary/10">
                {currentAccount.tipo === 'empresa' ? (
                  <Building2 className="h-4 w-4 text-primary" />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{currentAccount.nome}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">{currentAccount.email}</p>
                  <Badge 
                    variant={currentAccount.tipo === 'empresa' ? 'default' : 'secondary'}
                    className="text-xs px-2 py-0.5"
                  >
                    {currentAccount.tipo === 'empresa' ? 'Empresa' : 'Personal'}
                  </Badge>
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-80 bg-background/95 backdrop-blur-lg border rounded-2xl shadow-card-hover"
          align="start"
        >
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Contas</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddAccount}
                className="h-8 w-8 p-0 hover:bg-accent/10 rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Troca de tipo de conta */}
          <DropdownMenuItem 
            className="px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-xl mx-2"
            onClick={currentAccount.tipo === 'personal' ? handleSwitchToEmpresa : handleSwitchToPessoal}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="p-2 rounded-xl bg-accent/10">
                {currentAccount.tipo === 'personal' ? (
                  <Building2 className="h-4 w-4 text-accent" />
                ) : (
                  <User className="h-4 w-4 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {currentAccount.tipo === 'personal' 
                    ? 'Mudar para Empresa' 
                    : 'Mudar para Pessoal'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentAccount.tipo === 'personal'
                    ? 'Acesse sua conta empresarial'
                    : 'Voltar para conta pessoal'
                  }
                </p>
              </div>
              <LogIn className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Contas salvas */}
          {savedAccounts.filter(acc => acc.id !== currentAccount.id).map((account) => (
            <DropdownMenuItem 
              key={account.id}
              className="px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-xl mx-2"
              onClick={() => onAccountSwitch(account)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="p-2 rounded-xl bg-muted">
                  {account.tipo === 'empresa' ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{account.nome}</p>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                </div>
                <Badge 
                  variant={account.tipo === 'empresa' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {account.tipo === 'empresa' ? 'Empresa' : 'Personal'}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {/* Adicionar nova conta */}
          <DropdownMenuItem 
            className="px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-xl mx-2"
            onClick={onAddAccount}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="p-2 rounded-xl bg-primary/10">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Adicionar nova conta</p>
                <p className="text-xs text-muted-foreground">Conecte outra conta</p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
};

export default AccountSwitcher;