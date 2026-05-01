import { Pedido, TipoPedido } from '../types';

export function parsePedidos(texto: string): Pedido[] {
  if (!texto) return [];

  // Normalizar quebras de linha e tratar o texto como um todo
  const textoLimpo = texto.replace(/\r\n/g, '\n');

  // Dividir por blocos de pedido. Tenta identificar o início de um novo pedido
  // pelo marcador "Pedido" precedido ou não por emoji.
  const blocos = textoLimpo
    .split(/(?=📦?\s*Pedido\s+(?:\d+|#))/i)
    .filter(bloco => bloco.trim().length > 10);
  
  const novosPedidos: Pedido[] = [];

  blocos.forEach(bloco => {
    // Ignorar pedidos cancelados ou retirada (case-insensitive)
    const blocoUpper = bloco.toUpperCase();
    if (blocoUpper.includes('CANCELADO') || blocoUpper.includes('RETIRADA') || blocoUpper.includes('RETIRA NO LOCAL')) return;

    // Helper para extrair campos de linha única
    const extrairCampo = (regex: RegExp) => {
      const match = bloco.match(regex);
      if (!match) return '';
      const valor = match[1].trim();
      const valorLower = valor.toLowerCase();
      // Ignorar se o valor for apenas "não informado..."
      if (
        valorLower === 'não informado' || 
        valorLower.includes('não informado pelo cliente') || 
        valorLower.includes('não informado pelo usuário')
      ) return '';
      return valor;
    };

    // Helper para extrair seções que podem ter múltiplas linhas (até o próximo marcador)
    const extrairSecao = (regexMarcador: RegExp) => {
      const matchStart = bloco.match(regexMarcador);
      if (!matchStart || matchStart.index === undefined) return '';
      
      const posInicio = matchStart.index + matchStart[0].length;
      const resto = bloco.substring(posInicio);
      
      // Lista de possíveis marcadores que indicam o fim de uma seção
      const marcadoresFim = /\n\s*(?:👤|📞|🏠|📍|🍕|🍔|🥤|💳|📝|⏱|📦|Pedido|#|R\$|Forma|Obs)/i;
      const matchFim = resto.match(marcadoresFim);
      let textoSecao = matchFim ? resto.substring(0, matchFim.index).trim() : resto.trim();
      
      const textoLower = textoSecao.toLowerCase();
      if (textoLower.includes('não informado') && textoSecao.length < 50) return '';
      return textoSecao;
    };

    // Número do Pedido
    const numMatch = bloco.match(/(?:Pedido|#)\s*(\d+)/i);
    const numeroPedido = numMatch ? numMatch[1] : '';

    // Dados do Cliente
    const nome = extrairCampo(/(?:Nome|Cliente|👤 Nome):\s*([^\n]+)/i);
    const telefoneRaw = extrairCampo(/(?:Telefone|📞 Telefone):\s*([^\n]+)/i);
    const telefone = telefoneRaw.replace(/\D/g, '');

    // Localização
    let enderecoRaw = extrairCampo(/(?:Endereço completo|Endereço|🏠 Endereço completo):\s*([^\n]+)/i);
    const bairro = extrairCampo(/(?:Bairro|📍 Bairro):\s*([^\n]+)/i);
    
    if (enderecoRaw && bairro && !enderecoRaw.toLowerCase().includes(bairro.toLowerCase())) {
      enderecoRaw = `${enderecoRaw}, ${bairro}`;
    } else if (!enderecoRaw && bairro) {
      enderecoRaw = `Bairro ${bairro}`;
    }

    // Itens do Pedido
    const sabores = extrairSecao(/(?:🍕|Pizza|Sabores da pizza):/i);
    const itens = extrairSecao(/(?:🍔|Itens adicionais|ajustes):/i);
    const refrigerante = extrairSecao(/(?:🥤|Refrigerante|Bebida):/i);

    // Tipo de Pedido (Combo/Avulso)
    let tipo: TipoPedido = 'AVULSO';
    const blocoParaTipo = bloco.toUpperCase();
    if (blocoParaTipo.includes('FAMÍLIA') || blocoParaTipo.includes('FAMILIA')) tipo = 'FAMILIA';
    else if (blocoParaTipo.includes('CASAL')) tipo = 'CASAL';

    // Valor Financeiro
    const valorMatch = bloco.match(/R\$\s*([\d,.]+)/i);
    const valorStr = valorMatch ? valorMatch[1].replace(/\./g, '').replace(',', '.') : '0';
    const valor = parseFloat(valorStr);

    // Pagamento e Notas
    const pagamento = extrairCampo(/(?:Forma de pagamento|Pagamento|💳 Forma de pagamento):\s*([^\n]+)/i);
    const observacoes = extrairCampo(/(?:Observações|Obs|📝 Observações):\s*([^\n]+)/i);

    // Normalização do Endereço para o Mapa
    let enderecoMap = (enderecoRaw || 'Endereço não informado').split(' - ')[0].split(' — ')[0].trim();
    if (enderecoMap && enderecoMap !== 'Endereço não informado') {
      if (!enderecoMap.toLowerCase().includes('pato branco')) {
        enderecoMap = `${enderecoMap}, Pato Branco, PR, Brasil`;
      } else if (!enderecoMap.toLowerCase().includes('brasil')) {
        enderecoMap = `${enderecoMap}, Brasil`;
      }
    }

    if (numeroPedido || nome || (enderecoRaw && enderecoRaw !== 'Endereço não informado')) {
      novosPedidos.push({
        id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        numeroPedido: numeroPedido || `S/N-${Date.now().toString().slice(-4)}`,
        nome: nome || (numeroPedido ? `Pedido #${numeroPedido}` : 'Cliente sem nome'),
        telefone: telefone,
        endereco: enderecoMap,
        tipo: tipo,
        valor: valor,
        pagamento: pagamento,
        sabores: sabores,
        itens: itens,
        refrigerante: refrigerante,
        observacoes: observacoes,
        status: 'PENDENTE',
        geocodificado: false,
      });
    }
  });

  return novosPedidos;
}
