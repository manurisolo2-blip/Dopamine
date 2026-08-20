// Dopamine product catalog — local data layer in Argentine Pesos (ARS).
(function (window) {
  const products = [
    {
      id: 'buzo-win',
      slug: 'buzo-win',
      name: 'Buzo WIN',
      category: 'hoodies',
      price: 115000,
      compareAtPrice: 135000,
      badge: 'NEW DROP',
      subtitle: 'Heavyweight Graphic Hoodie',
      stock: 12,
      description: 'Buzo con capucha de algodón premium pesado, fit oversized estructurado y estampa gráfica exclusiva Dopamine',
      details: 'Algodón rústico peinado de 420 GSM. Doble costura reforzada, bolsillo canguro y calce boxy',
      colors: [
        { id: 'black', name: 'Black', hex: '#0D0D0D' },
        { id: 'washed', name: 'Washed Black', hex: '#1C1C1E' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Buzos/Buzo WIN.webp',
        'Ropa/Buzos/Buzo WIN  back view.webp'
      ]
    },
    {
      id: 'remera-wireframe-waffle-noir',
      slug: 'remera-wireframe-waffle-noir',
      name: 'Remera Wireframe Waffle Noir',
      category: 'tops',
      price: 62000,
      compareAtPrice: null,
      badge: 'NEW DROP',
      subtitle: 'Thermal Longsleeve Tee',
      stock: 16,
      description: 'Remera manga larga en tejido térmico waffle noir con textura tridimensional y fit boxy relajado',
      details: 'Algodón waffle de 280 GSM. Puños acanalados, cuello alto ajustado y caída pesada',
      colors: [
        { id: 'noir', name: 'Noir', hex: '#0D0D0D' },
        { id: 'off-black', name: 'Off Black', hex: '#1E1E22' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Remeras/Longsleeve/WIREFRAME WAFFLE NOIR.webp',
        'Ropa/Remeras/Longsleeve/WIREFRAME WAFFLE NOIR Modelo.webp'
      ]
    },
    {
      id: 'camisa-bunny',
      slug: 'camisa-bunny',
      name: 'Camisa Bunny',
      category: 'tops',
      price: 82000,
      compareAtPrice: null,
      badge: 'LIMITED',
      subtitle: 'Relaxed Fit Streetwear Shirt',
      stock: 8,
      description: 'Camisa urbana de corte relajado con estampa de autor, cuello estructurado y botones al tono',
      details: 'Poplin de algodón premium 100%. Tacto suave, calce amplio y detalles de confección artesanal',
      colors: [
        { id: 'black', name: 'Black', hex: '#0D0D0D' },
        { id: 'white', name: 'Off White', hex: '#F0EFEA' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Camisas/Camisa Bunny.webp',
        'Ropa/Camisas/Camisa Bunny Back View.webp'
      ]
    },
    {
      id: 'campera-set',
      slug: 'campera-set',
      name: 'Campera SET',
      category: 'hoodies',
      price: 138000,
      compareAtPrice: 160000,
      badge: 'DROP 01',
      subtitle: 'Technical Track Jacket',
      stock: 6,
      description: 'Campera técnica con cuello alto, cierre completo de doble carro y silueta deportiva contemporánea',
      details: 'Tejido técnico cortavientos con forrería transpirable. Bolsillos laterales con cierre invisible',
      colors: [
        { id: 'black', name: 'Black', hex: '#0D0D0D' },
        { id: 'cement', name: 'Cement Gray', hex: '#8A8A8A' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Camperas/Campera SET.webp',
        'Ropa/Camperas/Campera SET Back view.webp'
      ]
    },
    {
      id: 'campera-fire-wash-black',
      slug: 'campera-fire-wash-black',
      name: 'Campera Fire Wash Black',
      category: 'hoodies',
      price: 145000,
      compareAtPrice: null,
      badge: 'BEST SELLER',
      subtitle: 'Washed Denim Jacket',
      stock: 5,
      description: 'Campera de denim con proceso de lavado artesanal washed black y terminaciones desgastadas sutiles',
      details: 'Denim 100% algodón de 13 oz. Proceso acid wash custom y remaches metálicos con logo grabado',
      colors: [
        { id: 'washed-black', name: 'Washed Black', hex: '#222225' },
        { id: 'vintage-black', name: 'Vintage Black', hex: '#161618' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Camperas/FIRE CAMPERA WASH BLACK.webp',
        'Ropa/Camperas/Campera SET Back view.webp'
      ]
    },
    {
      id: 'conjunto-baggy-morgan',
      slug: 'conjunto-baggy-morgan',
      name: 'Conjunto Baggy Morgan',
      category: 'sets',
      price: 185000,
      compareAtPrice: 210000,
      badge: 'EXCLUSIVO',
      subtitle: '2-Piece Streetwear Set',
      stock: 7,
      description: 'Conjunto coordinado de silueta ultra baggy con textura premium y detalles utilitarios de máxima presencia',
      details: 'Incluye buzo boxy y pantalón baggy con cordón de ajuste y puños ribelados',
      colors: [
        { id: 'noir', name: 'Noir', hex: '#0D0D0D' },
        { id: 'graphite', name: 'Graphite', hex: '#2A2A2E' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'Ropa/Conjuntos/CONJUNTO BAGGY MORGAN.webp',
        'Ropa/Conjuntos/CONJUNTO BAGGY MORGAN Side view.webp'
      ]
    },
    {
      id: 'jean-baggy-ice',
      slug: 'jean-baggy-ice',
      name: 'Jean Baggy Ice',
      category: 'bottoms',
      price: 98000,
      compareAtPrice: null,
      badge: 'NEW',
      subtitle: 'Wide Leg Light Wash Denim',
      stock: 14,
      description: 'Jean de calce baggy amplio en tono ice wash, tiro medio y caída holgada sobre las zapatillas',
      details: 'Denim rígido 100% algodón de 12.5 oz. Lavado claro con efecto vintage y 5 bolsillos clásicos',
      colors: [
        { id: 'ice-blue', name: 'Ice Blue', hex: '#9BB8D3' },
        { id: 'light-denim', name: 'Light Denim', hex: '#B2CBE3' }
      ],
      sizes: ['38', '40', '42', '44', '46'],
      images: [
        'Ropa/Jeanes/JEAN BAGGY ICE.webp',
        'Ropa/Jeanes/JEAN BAGGY ICE Back View.webp'
      ]
    },
    {
      id: 'jean-baggy-soul',
      slug: 'jean-baggy-soul',
      name: 'Jean Baggy Soul',
      category: 'bottoms',
      price: 98000,
      compareAtPrice: null,
      badge: 'CORE',
      subtitle: 'Wide Leg Dark Wash Denim',
      stock: 11,
      description: 'Jean baggy de silueta relaxed en tono dark soul wash, construido para resistir el uso diario',
      details: 'Denim 100% algodón estructurado. Remaches reforzados, tiro bajo-medio y botamanga ancha',
      colors: [
        { id: 'dark-denim', name: 'Dark Soul', hex: '#1C2536' },
        { id: 'black-denim', name: 'Raw Black', hex: '#121214' }
      ],
      sizes: ['38', '40', '42', '44', '46'],
      images: [
        'Ropa/Jeanes/JEAN BAGGY SOUL.webp',
        'Ropa/Jeanes/JEAN BAGGY SOUL back view.webp'
      ]
    }
  ];

  window.DopamineCatalog = {
    products,
    getProductBySlug(slug) { return products.find(product => product.slug === slug) || products[0]; },
    getProductById(id) { return products.find(product => product.id === id) || products[0]; },
    getRelated(product, limit = 4) {
      return products.filter(item => item.id !== product.id && (item.category === product.category || item.badge === product.badge)).slice(0, limit);
    }
  };
})(window);
