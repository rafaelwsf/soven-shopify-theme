if (!customElements.get('soven-roma-bundle')) {
  customElements.define('soven-roma-bundle', class extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      requestAnimationFrame(() => this.initialize());
    }
    initialize() {
      this.section = this.closest('section');
      this.form = this.closest('form');
      this.variants = JSON.parse(this.section.querySelector('[data-variants]').textContent);
      this.media = JSON.parse(this.section.querySelector('[data-roma-variant-media]').textContent);
      this.selects = [...this.querySelectorAll('[data-bundle-select]')];
      this.button = this.section.querySelector('[data-add]');
      this.buttonText = this.section.querySelector('[data-add-text]');
      this.money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:this.dataset.currency}).format(value/100);
      const active = this.section.querySelector('[data-variant-id]').value;
      const first = this.variants.find(v => String(v.id) === active && !v.option2.startsWith('set-')) || this.variants.find(v => v.option2 === '6');
      const defaults = [first.id];
      for(const code of ['7','8','6']) { const candidate = this.variants.find(v => v.option2 === code); if(candidate && !defaults.includes(candidate.id) && defaults.length < 3) defaults.push(candidate.id); }
      this.selects.forEach((select,index) => { [...select.options].forEach(option => {option.textContent = this.media[option.value]?.label || option.textContent;}); select.value = String(defaults[index]); });
      this.abortController = new AbortController();
      const signal = this.abortController.signal;
      this.addEventListener('change', () => this.update(), {signal});
      this.section.addEventListener('soven:variant-changed', () => this.update(), {signal});
      this.form.addEventListener('submit', event => this.submit(event), {signal});
      this.update();
    }
    disconnectedCallback() {this.abortController?.abort();this.initialized=false;}
    get mode() {return this.querySelector('input[type="radio"]:checked')?.value;}
    get chosen() {return this.selects.map(select=>this.variants.find(v=>String(v.id)===select.value));}
    update() {
      const pack=this.mode==='bundle';
      this.section.classList.toggle('roma-bundle-active',pack);
      this.querySelector('[data-bundle-contents]').hidden=!pack;
      this.querySelector('[data-bundle-error]').hidden=true;
      const current=this.variants.find(v=>String(v.id)===this.section.querySelector('[data-variant-id]').value);
      this.querySelector('[data-single-price]').textContent=this.money(current?.price||0);
      const chosen=this.chosen;
      const original=chosen.reduce((sum,v)=>sum+v.price,0);
      const saving=Math.min(...chosen.map(v=>v.price));
      this.querySelector('[data-bundle-discount]').textContent='−'+(original ? Math.floor(saving/original*100) : 0)+'%';
      this.querySelector('[data-bundle-original]').textContent=this.money(original);
      this.querySelector('[data-bundle-total]').textContent=this.money(original-saving);
      this.querySelector('[data-bundle-saving]').textContent='Ahorras '+this.money(saving);
      this.querySelectorAll('[data-bundle-image]').forEach((img,index)=>{const media=this.media[chosen[index].id];img.src=media.images[1];img.alt='Soven Roma — '+media.label;});
      if(pack){const inStock=chosen.every(v=>v.available);this.button.disabled=this.busy||!inStock||this.dataset.discountReady!=='true';this.buttonText.textContent=this.busy?'AÑADIENDO…':!inStock?'AGOTADO':this.dataset.discountReady!=='true'?'PRÓXIMAMENTE':'AÑADIR PACK · '+this.money(original-saving);}
      else{this.button.disabled=!current?.available;this.buttonText.textContent=current?.available?'AÑADIR A LA BOLSA':'AGOTADO';}
    }
    async submit(event) {
      if (this.mode !== 'bundle') return;
      event.preventDefault();
      if (this.busy || this.dataset.discountReady !== 'true' || this.chosen.some(v => !v.available)) return;
      this.busy = true;
      this.update();
      const items = [];
      for (const variant of this.chosen) {
        const item = items.find(item => item.id === variant.id);
        if (item) item.quantity++;
        else items.push({id:variant.id,quantity:1});
      }
      try {
        const root = window.Shopify?.routes?.root || '/';
        const response = await fetch(root + 'cart/add.js', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items})});
        const result = await response.json();
        if (!response.ok) throw new Error(typeof result.description === 'string' ? result.description : 'No se pudo añadir el pack. Inténtalo de nuevo.');
        const code = this.dataset.discountCode.trim();
        window.location.assign(code ? root + 'discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent(root + 'cart') : root + 'cart');
      } catch(error) {
        this.busy = false;
        this.update();
        const notice = this.querySelector('[data-bundle-error]');
        notice.textContent = error.message;
        notice.hidden = false;
      }
    }
  });
}
