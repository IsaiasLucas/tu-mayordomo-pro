import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { COUNTRIES, type Country } from "@/lib/countries";

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  detectingCountry?: boolean;
}

export function CountrySelector({ 
  value, 
  onValueChange, 
  disabled = false,
  detectingCountry = false 
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = COUNTRIES.find((country) => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-11 sm:h-12 w-full justify-between text-base",
            !selectedCountry && "text-muted-foreground",
            detectingCountry && "animate-pulse"
          )}
          disabled={disabled || detectingCountry}
        >
          {detectingCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>Detectando...</span>
            </span>
          ) : selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <span className="text-xs text-muted-foreground">({selectedCountry.currency})</span>
            </span>
          ) : (
            "Selecciona un país..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[400px] p-0 z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar país..." 
            className="h-11"
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No se encontraron países</p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Países disponibles">
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span className="text-2xl mr-3">{country.flag}</span>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{country.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {country.currency} • {country.phone.placeholder}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
