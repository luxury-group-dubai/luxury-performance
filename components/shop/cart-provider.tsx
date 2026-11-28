'use client';
import { ActionLabel } from '@/components/action-label';
/* eslint-disable @next/next/no-img-element */
import { ActionArrow } from '@/components/action-arrow';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { money, type Cart, type CartLine, type CartReply, type OrderPlan } from '@/lib/shop/types';
import { installationFor } from '@/lib/shop/installation';
import { isSpecial } from '@/lib/shop/order-policy';
import styles from './cart-drawer.module.css';
type AddRequest={handle:string;variantId:string;quantity:number;title:string;variantTitle:string;confirmSpecial?:number;installation?:boolean;parentLineId?:string};
type Context={add:(request:AddRequest)=>Promise<void>;open:()=>void;busy:boolean;count:number};
const CartContext=createContext<Context|null>(null);

function trackCartAddition(reply: CartReply, variantId: string) {
 const quantity = reply.addedQuantity;
 const variant = reply.cart?.lines.nodes.find(line => line.merchandise.id === variantId)?.merchandise;
 if (!quantity || quantity < 1 || !variant) return;

 const price = Number(variant.price.amount);
 if (!Number.isFinite(price)) return;

 const analytics = window as Window & {
  gtag?: (command: 'event', event: 'add_to_cart', parameters: {
   currency: string;
   value: number;
   items: { item_id: string; item_name: string; item_variant: string; price: number; quantity: number }[];
  }) => void;
 };

 try {
  analytics.gtag?.('event', 'add_to_cart', {
   currency: variant.price.currencyCode,
   value: price * quantity,
   items: [{
    item_id: variant.sku || variant.id,
    item_name: variant.product.title,
    item_variant: variant.title,
    price,
    quantity,
   }],
  });
 } catch {
  // The cart update has already succeeded if analytics is unavailable.
 }
}

export function useShopCart(){const c=useContext(CartContext);if(!c)throw new Error('Cart unavailable');return c;}
export function CartButton() {
  const cart = useShopCart();
  return (
    <button className="shop-bag-button" onClick={cart.open} aria-label={`Open cart, ${cart.count} ${cart.count === 1 ? 'item' : 'items'}`}>
      <span className="shop-cart-icon" aria-hidden="true">
        <ShoppingBag size={18} />
        {cart.count > 0 && <span className="shop-cart-count">{cart.count}</span>}
      </span>
    </button>
  );
}

function CartItem({ line, busy, onClose, onUpdate, onIncrease, onInstallation }: {
  line: CartLine;
  busy: boolean;
  onClose: () => void;
  onUpdate: (lineId: string, quantity: number) => void;
  onIncrease: (request: AddRequest) => void;
  onInstallation: (lineId: string, enabled: boolean) => void;
}) {
  const { merchandise, installation } = line;
  const { product } = merchandise;
  const image = merchandise.image ?? product.featuredImage;
  const serviceLine = installationFor(line);
  const specialOrder = isSpecial(line.attributes);

  return (
    <li className={styles.item}>
      <div className={styles.thumbnail}>
        {image && <img src={image.url} alt="" loading="lazy" />}
      </div>
      <div className={styles.itemDetails}>
        <h3><Link href={`/products/${product.handle}`} onClick={onClose}>{product.title}</Link></h3>
        {merchandise.title !== 'Default Title' && <p className={styles.variant}>{merchandise.title}</p>}
        <span className={`shop-stock${specialOrder ? ' special' : ''} ${styles.stock}`}>
          {serviceLine ? 'Installation' : specialOrder ? 'Special order' : 'In stock'}
        </span>
        <div className={styles.itemPurchase}>
          {serviceLine ? (
            <p className={styles.variant}>Quantity {line.quantity} · Matches your exhaust</p>
          ) : (
            <div className={styles.quantity} role="group" aria-label={`Quantity for ${product.title}`}>
              <button type="button" disabled={busy} aria-label={`Decrease ${product.title}`} onClick={() => onUpdate(line.id, line.quantity - 1)}><Minus size={15} aria-hidden="true" /></button>
              <span>{line.quantity}</span>
              <button type="button" disabled={busy} aria-label={`Increase ${product.title}`} onClick={() => onIncrease({
                handle: product.handle, variantId: merchandise.id, quantity: 1, title: product.title,
                variantTitle: merchandise.title, parentLineId: line.id,
              })}><Plus size={15} aria-hidden="true" /></button>
            </div>
          )}
          <span className={styles.price}>{money(line.cost.totalAmount)}</span>
        </div>
        {serviceLine && <p className={styles.variant}>{line.attributes.find(attribute => attribute.key === 'Installation for')?.value}</p>}
        <button type="button" className={styles.textAction} disabled={busy} aria-label={`Remove ${product.title}`} onClick={() => onUpdate(line.id, 0)}>Remove</button>
        {installation && (
          <div className={styles.installation}>
            <p>{installation.title}</p>
            <button type="button" className={styles.textAction} disabled={busy} onClick={() => onInstallation(line.id, !installation.included)}>
              {installation.included ? 'Remove installation' : `Add installation${installation.quantity > 1 ? ` for ${installation.quantity} units` : ''} + ${money({ ...installation.price, amount: String(Number(installation.price.amount) * installation.quantity) })}`}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function CartProvider({children}:{children:ReactNode}){
 const [cart,setCart]=useState<Cart|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState<{request:AddRequest;plan:OrderPlan}|null>(null);
 const drawer=useRef<HTMLDialogElement>(null),prompt=useRef<HTMLDialogElement>(null),active=useRef(false);
 const lock=useRef<{overflow:string;paddingRight:string}|null>(null);
 function lockScroll(){if(lock.current)return;lock.current={overflow:document.documentElement.style.overflow,paddingRight:document.body.style.paddingRight};const gap=getComputedStyle(document.documentElement).scrollbarGutter.includes('stable')?0:innerWidth-document.documentElement.clientWidth;document.documentElement.style.overflow='hidden';if(gap)document.body.style.paddingRight=`${gap}px`;}
 function unlockScroll(){if(drawer.current?.open||prompt.current?.open||!lock.current)return;document.documentElement.style.overflow=lock.current.overflow;document.body.style.paddingRight=lock.current.paddingRight;lock.current=null;}
 function show(el:HTMLDialogElement|null){if(el&&!el.open){lockScroll();el.showModal();}}
 function close(el:HTMLDialogElement|null){if(!el)return;el.classList.add('shop-closing');setTimeout(()=>{el.close();el.classList.remove('shop-closing');unlockScroll();},220);}
 useEffect(()=>{fetch('/api/cart').then(r=>r.json()).then((d:CartReply)=>{if(d.cart)setCart(d.cart);}).catch(()=>{});return ()=>{if(lock.current){document.documentElement.style.overflow=lock.current.overflow;document.body.style.paddingRight=lock.current.paddingRight;}};},[]);
 async function call(body:Record<string,unknown>){const r=await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d:CartReply=await r.json();if(d.cart!==undefined)setCart(d.cart);if(d.message)throw new Error(d.message);if(!r.ok&&!d.confirmation)throw new Error('Please try again.');if(d.warnings?.length)setError(d.warnings.map(w=>w.message).join(' '));return d;}
 async function add(request: AddRequest) {
  if (active.current) return;
  active.current = true;
  setBusy(true);
  setError('');
  try {
   const reply = await call({ action: 'add', ...request });
   if (reply.confirmation) {
    setNotice({ request, plan: reply.confirmation });
    show(prompt.current);
    return;
   }
   trackCartAddition(reply, request.variantId);
   prompt.current?.close();
   setNotice(null);
   show(drawer.current);
  } catch (error) {
   setError(error instanceof Error ? error.message : 'Could not update your cart.');
   if (!prompt.current?.open) show(drawer.current);
  } finally {
   active.current = false;
   setBusy(false);
  }
 }
 async function update(lineId:string,quantity:number){if(active.current)return;active.current=true;setBusy(true);setError('');try{await call({action:'update',lineId,quantity});}catch(e){setError(e instanceof Error?e.message:'Could not update your cart.');}finally{active.current=false;setBusy(false);}}
 async function setInstallation(lineId:string,enabled:boolean){if(active.current)return;active.current=true;setBusy(true);setError('');try{await call({action:'installation',lineId,enabled});}catch(e){setError(e instanceof Error?e.message:'Could not update installation.');}finally{active.current=false;setBusy(false);}}
 async function checkout(){if(active.current)return;active.current=true;setBusy(true);setError('');try{const d=await call({action:'checkout'});if(d.cart?.checkoutUrl&&d.cart.totalQuantity)location.assign(d.cart.checkoutUrl);else throw new Error('Your cart is empty.');}catch(e){setError(e instanceof Error?e.message:'Could not open checkout.');active.current=false;setBusy(false);}}
 const count = cart?.totalQuantity ?? 0;
 const closeCart = () => close(drawer.current);
 return <CartContext.Provider value={{add,open:()=>show(drawer.current),busy,count}}>{children}
  <dialog
   ref={drawer}
   className={`shop-drawer ${styles.drawer}`}
   aria-labelledby="shop-cart-title"
   onCancel={event => { event.preventDefault(); closeCart(); }}
   onClose={unlockScroll}
   onClick={event => {
    if (event.target !== event.currentTarget) return;
    const { left, top, right, bottom } = event.currentTarget.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) closeCart();
   }}
  >
   <header className={styles.header}>
    <div className={styles.heading}>
     <h2 id="shop-cart-title">Cart</h2>
     {count > 0 && <span className={styles.itemCount} aria-live="polite">{count} {count === 1 ? 'item' : 'items'}</span>}
    </div>
    <button type="button" className={styles.close} aria-label="Close cart" onClick={closeCart}><X size={21} aria-hidden="true" /></button>
   </header>
   <div className={styles.contents} aria-busy={busy}>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {cart?.lines.nodes.length ? (
     <ul className={styles.items} role="list">
      {cart.lines.nodes.map(line => (
       <CartItem key={line.id} line={line} busy={busy} onClose={closeCart} onUpdate={update} onIncrease={add} onInstallation={setInstallation} />
      ))}
     </ul>
    ) : (
     <div className={styles.empty}>
      <h3>Your cart is empty.</h3>
      <button type="button" className={`shop-button ${styles.primary}`} onClick={closeCart}>
       <ActionLabel>Continue browsing</ActionLabel><ActionArrow direction="right" size={18} />
      </button>
     </div>
    )}
   </div>
   {cart && count > 0 && (
    <footer className={styles.summary}>
     <div className={styles.subtotal}><span>Subtotal</span><strong>{money(cart.cost.subtotalAmount)}</strong></div>
     <p>Shipping and applicable taxes calculated at checkout.</p>
     <button type="button" className={`shop-button ${styles.primary}`} disabled={busy} onClick={checkout}>
      <ActionLabel>{busy ? 'Updating…' : 'Continue to checkout'}</ActionLabel><ActionArrow direction="right" size={18} />
     </button>
    </footer>
   )}
  </dialog>
  <dialog ref={prompt} className="shop-order-dialog" aria-labelledby="order-title" onCancel={e=>{e.preventDefault();close(prompt.current);}} onClose={unlockScroll}><header><span className="tiny-label">Before you add it</span><button className="shop-close" aria-label="Close special order notice" onClick={()=>close(prompt.current)}><X/></button></header><h2 id="order-title">A little more<br/>worth waiting for.</h2>{notice&&<><span className="shop-stock special">Special Order</span><h3>{notice.request.title}</h3><p>{notice.request.variantTitle==='Default Title'?'':notice.request.variantTitle}</p><p className="shop-order-explanation">{notice.plan.stock>0?`Only ${notice.plan.stock} ${notice.plan.stock===1?'unit is':'units are'} in stock.${notice.plan.inCart?` ${notice.plan.inCart} already in your cart.`:''} ${notice.plan.special} additional ${notice.plan.special===1?'unit will':'units will'} be ordered from our supplier.`:'This item is ordered from our supplier and takes longer to arrive.'}</p><p>We’ll contact you with the estimated delivery time after your order.</p>{error&&<p className="shop-error" role="alert">{error}</p>}<button disabled={busy} className="shop-button" onClick={()=>add({...notice.request,confirmSpecial:notice.plan.special})}><ActionLabel>{busy?'Adding…':`Add ${notice.plan.special} as Special Order${notice.plan.stocked?` + ${notice.plan.stocked} from stock`:''}`}</ActionLabel><ActionArrow direction="right" size={16} /></button><button className="shop-text-button action-secondary" disabled={busy} onClick={()=>close(prompt.current)}>Keep browsing</button></>}</dialog>
 </CartContext.Provider>;
}
