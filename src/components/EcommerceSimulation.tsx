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
    <section id="EcommerceSimulation" className="py-8 md:py-12 bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] relative">
      {/* Overlay de "Em Breve" - Mobile First */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center px-4">
        <div className="text-center w-full max-w-sm">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full px-4 py-2 mb-3 md:mb-4 inline-block">
            <span className="text-white font-bold text-sm md:text-base">🚀 EM BREVE</span>
          </div>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
            Loja Oficial <span className="text-pink-500">INTERBØX</span>
          </h3>
          <p className="text-gray-300 text-sm md:text-base max-w-xs md:max-w-md mx-auto leading-relaxed">
            Produtos exclusivos da marca INTERBØX em breve disponíveis para compra.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-0">
        {/* Header compacto */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
            ØFICIAL <span className="text-pink-500">INTERBØX</span>
          </h2>
        </div>
        
        {/* Grid responsivo compacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 opacity-40">
          {products.map((product, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 flex flex-col items-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain rounded-lg mb-3 md:mb-4 bg-white/10" 
              />
              <h3 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2 text-center leading-tight">
                {product.name}
              </h3>
              <span className="text-pink-500 font-bold text-base md:text-lg mb-1 md:mb-2">
                R$ {product.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 