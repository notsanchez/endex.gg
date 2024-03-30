export function formatCurrency(valor) {
    const cleanedValue = String(valor)?.replace(/[^\d,.]/g, '').replace(',', '.');
    const valorArredondado = Math.floor(parseFloat(cleanedValue) * 100) / 100; // Arredonda para baixo
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorArredondado);
    return valorFormatado;
}
