export function SearchingOrders() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="relative w-16 h-16 mb-6">
        <div className="radar-ring" />
        <div className="radar-ring radar-ring--delay" />
        <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-accent" />
      </div>

      <h2 className="font-display text-lg font-700">Procurando novos pedidos</h2>
      <p className="mt-2 text-sm text-muted max-w-xs">
        Nenhum pedido pendente no momento. Assim que um pedido for confirmado no iFood, ele aparece
        aqui automaticamente.
      </p>
    </div>
  );
}
