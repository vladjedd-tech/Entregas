import { LayoutList, Map as MapIcon, Route, PlusCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
}

export function BottomNav({ abaAtiva, setAbaAtiva }: BottomNavProps) {
  const tabs = [
    { id: 'pedidos', label: 'Pedidos', icon: LayoutList },
    { id: 'rota', label: 'Rota', icon: Route },
    { id: 'mapa', label: 'Mapa', icon: MapIcon },
    { id: 'historico', label: 'Histórico', icon: CheckCircle2 },
    { id: 'importar', label: 'Importar', icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-2 py-1 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setAbaAtiva(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
            abaAtiva === tab.id 
              ? "text-primary bg-zinc-900" 
              : "text-zinc-500 active:bg-zinc-900"
          )}
        >
          <tab.icon className={cn("w-6 h-6", abaAtiva === tab.id && "scale-110")} />
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
