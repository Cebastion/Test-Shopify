document.addEventListener('DOMContentLoaded', async () => {
  const sections = document.querySelectorAll('.featured-products');

  sections.forEach(async (sectionEl) => {
    const sectionId = sectionEl.dataset.sectionId;
    const productId = sectionEl.dataset.productId;
    const limit = sectionEl.dataset.limit || 6;

    const container = sectionEl.querySelector('.slider-track');
    const prev = sectionEl.querySelector('.slider-btn.prev');
    const next = sectionEl.querySelector('.slider-btn.next');
    const cardWidth = 260;
    let products = [];

    if (productId) {
      try {
        const res = await fetch(`${window.Shopify.routes.root}recommendations/products.json?product_id=${productId}&limit=${limit}`);
        const data = await res.json();
        products = data.products || [];
      } catch (err) {
        console.warn('Shopify API unavailable, using fallback JSON.', err);
      }
    }

    if (!products.length) {
      // fallback products
      products = [
        {"title":"Elastic Overalls Beige","url":"/products/elastic-overalls-beige","featured_image":"https://cdn.shopify.com/s/files/1/0833/5955/9013/files/elastic-overalls-beige.jpg","price":8900,"compare_at_price":10900},
        {"title":"Classic Denim Jacket","url":"/products/classic-denim-jacket","featured_image":"https://cdn.shopify.com/s/files/1/0833/5955/9013/files/classic-denim-jacket.jpg","price":12900,"compare_at_price":0},
        {"title":"Slim Fit Pants Black","url":"/products/slim-fit-pants-black","featured_image":"https://cdn.shopify.com/s/files/1/0833/5955/9013/files/slim-fit-pants-black.jpg","price":7400,"compare_at_price":9900}
      ];
    }

    container.innerHTML = '';
    products.forEach((p, i) => {
      const price = p.price / 100;
      const compare = (p.compare_at_price || 0) / 100;
      const sale = compare > price;
      const isNew = i === 1;
      const priceHTML = sale
        ? `<span class="old">$${compare.toFixed(2)}</span> <span class="new">$${price.toFixed(2)}</span>`
        : `<span class="new">$${price.toFixed(2)}</span>`;

      // Изображение
      const imgSrc = p.featured_image ? (p.featured_image.startsWith('//') ? 'https:' + p.featured_image : p.featured_image) : '';

      // Описание
      let desc = '';
      if (p.description) desc = p.description.split('\n')[0];
      else if (p.body_html) desc = p.body_html.replace(/<[^>]*>?/gm, '').split('\n')[0];

      // Рейтинг
      let rating = 0;
      if (p.metafields && p.metafields.custom && p.metafields.custom.rating) {
        rating = p.metafields.custom.rating;
      } else {
        rating = Math.round((4 + Math.random()) * 10) / 10; // fallback 4.0-5.0
      }
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));

      container.innerHTML += `
        <div class="featured-card">
          ${sale ? `<div class="tag sale">Save $${(compare - price).toFixed(0)}</div>` : ''}
          ${isNew ? `<div class="tag new">New</div>` : ''}
          <a href="${p.url}" class="image">
            <img src="${imgSrc}" alt="${p.title}">
          </a>
          <div class="info">
            <div class="rating">${stars} <span>${rating}</span></div>
            <a href="${p.url}" class="title">${p.title}</a>
            ${desc ? `<p class="desc">${desc}</p>` : ''}
            <div class="price">${priceHTML}</div>
          </div>
        </div>
      `;
    });

    // Навигация
    next.addEventListener('click', () => container.scrollBy({ left: cardWidth, behavior: 'smooth' }));
    prev.addEventListener('click', () => container.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
  });
});
