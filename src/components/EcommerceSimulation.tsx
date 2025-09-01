const products = [
  {
    name: 'Camiseta INTERBØX Oficial pink',
    price: 149.90,
    image: '/images/shirt1pink.png',
  },
  {
    name: 'Camiseta INTERBØX Oficial black',
    price: 149.90,
    image: '/images/shirt1blck.png',
  },
  {
    name: 'Tênis INTERBØX Pro',
    price: 299.90,
    image: '/images/tenis.png',
  },
];

export default function EcommerceSimulation() {
  return (
    <section className="py-16 bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] relative">
      {/* Overlay de "Em Breve" */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full px-8 py-3 mb-6 inline-block">
            <span className="text-white font-bold text-lg">🚀 EM BREVE</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loja Oficial <span className="text-pink-500">INTERBØX</span>
          </h3>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Produtos exclusivos da marca INTERBØX em breve disponíveis para compra.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-0">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ØFICIAL <span className="text-pink-500">INTERBØX</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40">
          {products.map((product, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col items-center">
              <img src={product.image} alt={product.name} className="w-56 h-56 object-contain rounded-lg mb-6 bg-white/10" />
              <h3 className="text-white font-bold text-lg mb-2 text-center">{product.name}</h3>
              <span className="text-pink-500 font-bold text-xl mb-2">R$ {product.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 