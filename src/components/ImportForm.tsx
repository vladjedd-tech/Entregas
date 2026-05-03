import { useState } from 'react';
import { parsePedidos } from '../services/parseService';
import { Pedido } from '../types';
import { Save, ClipboardPaste } from 'lucide-react';
import { Clipboard } from '@capacitor/clipboard';

interface ImportFormProps {
  onImport: (pedidos: Pedido[]) => void;
}

export function ImportForm({ onImport }: ImportFormProps) {
  const [texto, setTexto] = useState('');

  const [status, setStatus] = useState<string | null>(null);

  const handleImport = () => {
    if (!texto.trim()) return;
    const pedidos = parsePedidos(texto);
    if (pedidos.length === 0) {
      setStatus('Nenhum pedido válido encontrado no texto.');
      return;
    }
    onImport(pedidos);
    setTexto('');
    setStatus(null);
  };

  const handlePaste = async () => {
    try {
      let clipText = '';
      try {
        // Tentar via Plugin do Capacitor (Melhor para Android APK)
        const result = await Clipboard.read();
        clipText = result.value;
      } catch (capErr) {
        // Fallback para API do Navegador
        clipText = await navigator.clipboard.readText();
      }

      if (clipText) {
        setTexto(prev => prev ? prev + '\n' + clipText : clipText);
        setStatus(null);
      } else {
        setStatus('Clipboard vazio ou acesso negado.');
      }
    } catch (err) {
      console.error('Falha ao colar:', err);
      setStatus('Erro ao colar: Use Ctrl+V (Cmd+V) no campo abaixo devido a restrições do navegador.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
          Cole os pedidos aqui:
          <button 
            onClick={handlePaste}
            className="flex items-center gap-1 text-primary-dark font-black active:scale-95 transition-transform"
          >
            <ClipboardPaste className="w-4 h-4" />
            Colar
          </button>
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="📦 Pedido #123..."
          className="w-full h-80 p-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm font-mono shadow-sm"
        />
      </div>
      
      {status && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
          {status}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!texto.trim()}
        className="w-full py-4 bg-primary text-zinc-950 rounded-2xl font-brand text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98] transition-all"
      >
        <Save className="w-5 h-5" />
        Processar Pedidos
      </button>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 italic text-primary text-[10px] font-medium uppercase tracking-widest">
        <p>Dica: Copie o texto completo com vários pedidos começando com "📦 Pedido" para extrair todos de uma vez.</p>
      </div>
    </div>
  );
}
