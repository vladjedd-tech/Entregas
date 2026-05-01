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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setAbaAtiva(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
            abaAtiva === tab.id 
              ? "text-blue-600 bg-blue-50" 
              : "text-gray-500 active:bg-gray-100"
          )}
        >
          <tab.icon className={cn("w-6 h-6", abaAtiva === tab.id && "scale-110")} />
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
