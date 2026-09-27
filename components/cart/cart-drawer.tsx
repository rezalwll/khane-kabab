'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import {
  calculateItemTotal,
  calculateSubtotal,
} from '@/lib/order-calculations';
import { useCart } from '@/stores/cart-store';
export function CartDrawer() {
  const { items, drawerOpen, setDrawerOpen, increment, decrement, removeItem } =
    useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const subtotal = calculateSubtotal(items);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        const controls = drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,select',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [drawerOpen, setDrawerOpen]);
  return (
    <>
      {drawerOpen && (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="بستن سبد"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <aside
        ref={drawerRef}
        className={`cart-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div className="drawer-head">
          <div>
            <span>سبد شما</span>
            <strong>
              {items
                .reduce((sum, item) => sum + item.quantity, 0)
                .toLocaleString('fa-IR')}{' '}
              قلم غذا
            </strong>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="بستن سبد"
          >
            <X />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag />
            <h2>سبد خرید شما هنوز خالی است</h2>
            <p>یک غذای خوش‌طعم انتخاب کنید.</p>
            <Link
              href="/menu"
              onClick={() => setDrawerOpen(false)}
              className="primary-button"
            >
              مشاهده منو
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {items.map((item) => (
                <article className="drawer-item" key={item.key}>
                  <div className="drawer-item-image">
                    <Image
                      src={item.imageSnapshotForUI}
                      alt={item.titleSnapshotForUI}
                      fill
                      unoptimized
                      sizes="82px"
                    />
                  </div>
                  <div>
                    <h3>{item.titleSnapshotForUI}</h3>
                    {item.selectedOptions.length > 0 && (
                      <small>
                        {item.selectedOptions
                          .map((addon) => addon.title)
                          .join('، ')}
                      </small>
                    )}
                    {item.note && <small>یادداشت: {item.note}</small>}
                    <strong>{formatPrice(calculateItemTotal(item))}</strong>
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => decrement(item.key)}
                        aria-label={`کم کردن ${item.titleSnapshotForUI}`}
                        disabled={item.quantity === 1}
                      >
                        <Minus />
                      </button>
                      <span>{item.quantity.toLocaleString('fa-IR')}</span>
                      <button
                        type="button"
                        onClick={() => increment(item.key)}
                        aria-label={`زیاد کردن ${item.titleSnapshotForUI}`}
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove"
                    onClick={() => removeItem(item.key)}
                    aria-label={`حذف ${item.titleSnapshotForUI}`}
                  >
                    <Trash2 />
                  </button>
                </article>
              ))}
            </div>
            <div className="drawer-summary">
              <div>
                <span>جمع سفارش</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>هزینه ارسال</span>
                <small>در مرحله بعد محاسبه می‌شود</small>
              </div>
              <div className="total">
                <span>جمع فعلی</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link
                href="/checkout"
                onClick={() => setDrawerOpen(false)}
                className="primary-button"
              >
                ادامه ثبت سفارش
              </Link>
              <Link
                href="/cart"
                onClick={() => setDrawerOpen(false)}
                className="drawer-link"
              >
                مشاهده سبد کامل
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
