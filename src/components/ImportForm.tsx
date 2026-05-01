import { useState } from 'react';
import { parsePedidos } from '../services/parseService';
import { Pedido } from '../types';
import { Save, ClipboardPaste } from 'lucide-react';

interface ImportFormProps {
  onImport: (pedidos: Pedido[]) => void;
}

export function ImportForm({ onImport }: ImportFormProps) {
  const [texto, setTexto] = useState('');

  const handleImport = () => {
    if (!texto.trim()) return;
    const pedidos = parsePedidos(texto);
    if (pedidos.length === 0) {
      alert('Nenhum pedido válido encontrado no texto.');
      return;
    }
    onImport(pedidos);
    setTexto('');
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setTexto(clipText);
    } catch (err) {
      console.error('Falha ao colar:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
          Cole os pedidos aqui:
          <button 
            onClick={handlePaste}
            className="flex items-center gap-1 text-blue-500 font-medium active:scale-95 transition-transform"
          >
            <ClipboardPaste className="w-4 h-4" />
            Colar
          </button>
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="📦 Pedido #123..."
          className="w-full h-80 p-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm font-mono shadow-sm"
        />
      </div>
      
      <button
        onClick={handleImport}
        disabled={!texto.trim()}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98] transition-all"
      >
        <Save className="w-5 h-5" />
        Processar Pedidos
      </button>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic text-blue-700 text-xs">
        <p>Dica: Copie o texto completo com vários pedidos começando com "📦 Pedido" para extrair todos de uma vez.</p>
      </div>
    </div>
  );
}
