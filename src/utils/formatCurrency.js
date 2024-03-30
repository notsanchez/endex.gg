export function formatCurrency(valor) {
    const cleanedValue = String(valor)?.replace(/[^\d,.]/g, '').replace(',', '.');
    const valorArredondado = parseFloat(cleanedValue);
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorArredondado);
    return valorFormatado;
}
