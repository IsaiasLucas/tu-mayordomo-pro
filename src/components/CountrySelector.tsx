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
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-12 sm:h-12 w-full justify-between text-base touch-manipulation active:scale-[0.98] transition-transform",
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
            <span className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">{selectedCountry.flag}</span>
              <span className="text-sm sm:text-base">{selectedCountry.name}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">({selectedCountry.currency})</span>
            </span>
          ) : (
            "Selecciona un país..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 z-50 pointer-events-auto" 
        align="start"
        sideOffset={8}
        alignOffset={-8}
      >
        <Command className="touch-auto pointer-events-auto rounded-lg">
          <CommandInput 
            placeholder="Buscar país..." 
            className="h-12 text-base sticky top-0 bg-background z-10 border-b"
          />
          <CommandList 
            className="max-h-[min(400px,60vh)] overflow-y-auto overscroll-contain touch-pan-y pointer-events-auto scroll-smooth"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin'
            }}
          >
            <CommandEmpty>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No se encontraron países</p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Países disponibles" className="p-2">
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onValueChange(country.code);
                    setOpen(false);
                  }}
                  className="cursor-pointer touch-manipulation min-h-[56px] py-3 px-3 sm:px-4 active:bg-accent/50 transition-colors rounded-md my-1"
                >
                  <span className="text-3xl sm:text-2xl mr-3 sm:mr-4 flex-shrink-0">{country.flag}</span>
                  <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                    <span className="font-medium text-base sm:text-sm leading-tight">{country.name}</span>
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {country.currency} • {country.phone.placeholder}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 text-primary",
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
