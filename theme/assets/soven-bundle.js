if(!customElements.get('soven-bundle'))customElements.define('soven-bundle',class extends HTMLElement{
 connectedCallback(){
  if(this.ready)return;this.ready=true;
  const form=this.closest('form');if(!form)return;
  const variants=JSON.parse(this.querySelector('[data-bundle-variants]').textContent);
  const find=id=>variants.find(v=>String(v.id)===String(id));
  const money=value=>new Intl.NumberFormat('es-ES',{style:'currency',currency:this.dataset.currency}).format(value/100);
  const active=()=>this.querySelector('input:checked').closest('[data-bundle-option]');
  const button=form.querySelector('[data-add]');
  const refresh=()=>{
   this.querySelectorAll('[data-bundle-option]').forEach(option=>{
    const checked=option.querySelector('input').checked;
    option.querySelector('.soven-bundle__choices').hidden=!checked;
    const selects=[...option.querySelectorAll('select')];
    selects.forEach(select=>select.disabled=!checked);
    option.querySelector('[data-bundle-total]').textContent=money(selects.reduce((total,select)=>total+(find(select.value)?.price||0),0));
   });
   button.disabled=[...active().querySelectorAll('select')].some(select=>!find(select.value)?.available);
  };
  this.addEventListener('change',refresh);refresh();
  form.addEventListener('change',event=>{
   if(event.target.matches('[data-option-input]')){
    const id=form.querySelector('[data-variant-id]')?.value;
    this.querySelectorAll('[data-bundle-option]').forEach(option=>{if(find(id))option.querySelector('select').value=id});refresh();
   }
  });
  this.abort=new AbortController();
  form.addEventListener('submit',async event=>{
   event.preventDefault();event.stopImmediatePropagation();
   if(this.busy)return;
   const status=this.querySelector('[data-bundle-status]');
   const quantity=Number(form.querySelector('[data-quantity]')?.value||1);
   if(!Number.isSafeInteger(quantity)||quantity<1){status.textContent='Selecciona una cantidad válida.';return}
   const items=[];
   for(const select of active().querySelectorAll('select')){
    const variant=find(select.value);
    if(!variant?.available){status.textContent='Selecciona variantes disponibles.';return}
    const existing=items.find(item=>item.id===variant.id);
    if(existing)existing.quantity+=quantity;else items.push({id:variant.id,quantity});
   }
   this.busy=true;button.disabled=true;status.textContent='Añadiendo tu selección…';
   try{
    const root=window.Shopify?.routes?.root||'/';
    const response=await fetch(root+'cart/add.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({items})});
    if(!response.ok)throw new Error('No se pudo añadir el pack. Comprueba el stock de los colores elegidos.');
    await response.json();window.location.assign(root+'cart');
   }catch(error){status.textContent=error instanceof TypeError?'Error de conexión. Revisa tu bolsa antes de volver a intentarlo.':error.message;this.busy=false;refresh()}
  },{capture:true,signal:this.abort.signal});
 }
 disconnectedCallback(){this.abort?.abort();this.ready=false}
});
