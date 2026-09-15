if (!customElements.get('soven-complete-look')) {
  customElements.define('soven-complete-look', class extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.addEventListener('change', event => {
        if (!event.target.matches('[data-variant]')) return;
        const card = event.target.closest('article');
        const option = event.target.selectedOptions[0];
        card.querySelector('[data-price]').textContent = option.dataset.price;
        const compare = card.querySelector('[data-compare]');
        compare.textContent = option.dataset.compare;
        compare.hidden = !option.dataset.compare;
      });
      this.addEventListener('click', async event => {
        const button = event.target.closest('[data-add-look]');
        if (!button || button.disabled) return;
        event.preventDefault();
        event.stopPropagation();
        const card = button.closest('article');
        const select = card.querySelector('[data-variant]');
        const status = card.querySelector('[data-status]');
        const label = button.textContent;
        button.disabled = true;
        select.disabled = true;
        button.textContent = 'AÑADIENDO…';
        status.textContent = '';
        const root = window.Shopify?.routes?.root || '/';
        try {
          const response = await fetch(root + 'cart/add.js', {
            method: 'POST', headers: {'Content-Type':'application/json', 'Accept':'application/json'},
            body: JSON.stringify({items:[{id:select.value,quantity:1}]})
          });
          const result = await response.json();
          if (!response.ok) throw new Error('No se pudo añadir. Comprueba la disponibilidad e inténtalo de nuevo.');
          status.textContent = 'Añadido a tu bolsa.';
          window.location.assign(root + 'cart');
        } catch (error) {
          status.textContent = error instanceof TypeError ? 'Error de conexión. Revisa tu bolsa antes de intentarlo de nuevo.' : error.message;
          button.disabled = false;
          select.disabled = false;
          button.textContent = label;
        }
      });
    }
  });
}
