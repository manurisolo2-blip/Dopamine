// Dopamine product catalog — local data layer ready for a future PHP/MySQL API.
(function (window) {
  const products = [
    {
      id: 'signal-tee', slug: 'signal-tee', name: 'Signal Tee', category: 'tops', price: 48,
      compareAtPrice: null, badge: 'NEW', subtitle: 'Oversized Heavy Cotton Tee', stock: 18,
      description: 'Remera de algodón pesado con fit relajado y gráfica Dopamine. Diseñada para moverte sin perder estructura.',
      details: '100% algodón premium de 260 GSM. Fit oversized, cuello reforzado y estampa de alta densidad.',
      colors: [{ id: 'black', name: 'Black', hex: '#0D0D0D' }, { id: 'warm-white', name: 'Warm White', hex: '#F5F4EF' }, { id: 'lime', name: 'Electric Lime', hex: '#B8FF00' }, { id: 'stone', name: 'Stone', hex: '#A7A39A' }],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'phase-hoodie', slug: 'phase-hoodie', name: 'Phase Hoodie', category: 'hoodies', price: 110,
      compareAtPrice: 140, badge: 'BEST SELLER', subtitle: 'Heavyweight Fleece Pullover', stock: 7,
      description: 'Hoodie premium de algodón pesado con interior afelpado y una silueta limpia para todos los días.',
      details: 'Algodón french terry de 450 GSM. Capucha doble, bolsillo frontal y terminaciones de rib premium.',
      colors: [{ id: 'cement', name: 'Cement Gray', hex: '#8A8A8A' }, { id: 'black', name: 'Black', hex: '#0D0D0D' }],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'vector-pant', slug: 'vector-pant', name: 'Vector Pant', category: 'bottoms', price: 96,
      compareAtPrice: null, badge: 'NEW', subtitle: 'Relaxed Fit Cargo Pant', stock: 12,
      description: 'Pantalón cargo de silueta amplia con detalles utilitarios y construcción pensada para el movimiento.',
      details: 'Gabardina de algodón con bolsillos cargo, cintura ajustable y fit relajado.',
      colors: [{ id: 'black', name: 'Black', hex: '#0D0D0D' }, { id: 'dark-gray', name: 'Dark Gray', hex: '#1A1A1A' }],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'dopamine-cap', slug: 'dopamine-cap', name: 'Dopamine Cap', category: 'accessories', price: 42,
      compareAtPrice: null, badge: 'LIMITED', subtitle: 'Structured 6-Panel Cap', stock: 4,
      description: 'Gorra estructurada con logo Dopamine bordado y ajuste trasero metálico.',
      details: 'Gabardina de algodón, visera curva y bordado frontal de alta definición.',
      colors: [{ id: 'black', name: 'Black', hex: '#0D0D0D' }, { id: 'lime', name: 'Electric Lime', hex: '#B8FF00' }],
      sizes: ['ONE SIZE'],
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'afterhours-tee', slug: 'afterhours-tee', name: 'After Hours Tee', category: 'tops', price: 54,
      compareAtPrice: null, badge: 'DROP 01', subtitle: 'Boxy Graphic Tee', stock: 9,
      description: 'Remera gráfica de fit boxy con composición inspirada en la ciudad después de medianoche.',
      details: 'Algodón pesado, estampa frontal y trasera, fit boxy unisex.',
      colors: [{ id: 'black', name: 'Black', hex: '#0D0D0D' }, { id: 'stone', name: 'Stone', hex: '#A7A39A' }],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'grid-overshirt', slug: 'grid-overshirt', name: 'Grid Overshirt', category: 'hoodies', price: 128,
      compareAtPrice: 160, badge: 'LIMITED', subtitle: 'Technical Overshirt', stock: 3,
      description: 'Overshirt técnica de corte amplio para sumar una capa con presencia.',
      details: 'Nylon liviano, bolsillos utilitarios y cierres metálicos.',
      colors: [{ id: 'dark-gray', name: 'Dark Gray', hex: '#1A1A1A' }, { id: 'stone', name: 'Stone', hex: '#A7A39A' }],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'motion-short', slug: 'motion-short', name: 'Motion Short', category: 'bottoms', price: 68,
      compareAtPrice: null, badge: 'CORE', subtitle: 'Utility Nylon Short', stock: 14,
      description: 'Short utilitario de nylon con caída liviana y bolsillos laterales.',
      details: 'Nylon ripstop, cintura elástica y cordón ajustable.',
      colors: [{ id: 'black', name: 'Black', hex: '#0D0D0D' }, { id: 'lime', name: 'Electric Lime', hex: '#B8FF00' }],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=84'
      ]
    },
    {
      id: 'signal-socks', slug: 'signal-socks', name: 'Signal Socks', category: 'accessories', price: 18,
      compareAtPrice: null, badge: 'CORE', subtitle: 'Ribbed Logo Socks', stock: 28,
      description: 'Medias de algodón con logo tejido y construcción reforzada.',
      details: 'Pack de una unidad. Algodón peinado y puño acanalado.',
      colors: [{ id: 'white', name: 'White', hex: '#F5F4EF' }, { id: 'black', name: 'Black', hex: '#0D0D0D' }],
      sizes: ['ONE SIZE'],
      images: [
        'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=1000&q=84',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=84'
      ]
    }
  ];

  window.DopamineCatalog = {
    products,
    getProductBySlug(slug) { return products.find(product => product.slug === slug) || products[0]; },
    getRelated(product, limit = 4) {
      return products.filter(item => item.id !== product.id && (item.category === product.category || item.badge === product.badge)).slice(0, limit);
    }
  };
})(window);
