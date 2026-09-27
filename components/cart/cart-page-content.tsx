'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { calculateItemTotal, getOrderSummary } from '@/lib/order-calculations';
import { useCart } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';
import { useToastStore } from '@/stores/toast-store';
import { validateCoupon } from '@/lib/api/coupons';
import { cartItemsToApiLines } from '@/lib/cart-api';

export function CartPageContent() {
  const { items, increment, decrement, removeItem } = useCart();
  const { couponCode, setCoupon, removeCoupon } = useOrderStore();
  const showToast = useToastStore((state) => state.show);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [serverDiscount, setServerDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const localSummary = getOrderSummary(items, 0, 'delivery');
  const summary = {
    ...localSummary,
    discount: serverDiscount,
    total: localSummary.total - serverDiscount,
  };
  const apply = async () => {
    setApplying(true);
    setError('');
    try {
      const result = await validateCoupon({
        couponCode: code,
        fulfillmentType: 'delivery',
        items: cartItemsToApiLines(items),
      });
      if (result.valid) {
        setCoupon(result.normalizedCode);
        setServerDiscount(result.discountToman);
        setError('');
        setCode('');
        showToast('کد تخفیف معتبر است و اعمال شد');
      } else {
        setError(result.reason ?? 'کد تخفیف معتبر نیست');
      }
    } catch {
      setError('ارتباط با سامانه سفارش برقرار نیست.');
    } finally {
      setApplying(false);
    }
  };
  const remove = () => {
    removeCoupon();
    setServerDiscount(0);
    showToast('کد تخفیف حذف شد');
  };
  if (!items.length)
    return (
      <div className="empty-cart page-empty">
        <ShoppingBag />
        <h2>سبد خرید شما خالی است</h2>
        <p>از منوی امروز یک غذای خوش‌طعم انتخاب کنید.</p>
        <Link href="/menu" className="primary-button">
          مشاهده منو
        </Link>
      </div>
    );
  return (
    <div className="cart-page-grid">
      <section className="cart-list">
        <h2>اقلام سفارش</h2>
        {items.map((item) => (
          <article key={item.key}>
            <div className="cart-item-image">
              <Image
                src={item.imageSnapshotForUI}
                alt={item.titleSnapshotForUI}
                fill
                unoptimized
                sizes="110px"
              />
            </div>
            <div>
              <h3>{item.titleSnapshotForUI}</h3>
              <p>
                {item.selectedOptions.map((addon) => addon.title).join('، ') ||
                  item.shortDescriptionSnapshotForUI}
              </p>
              {item.note && <p>یادداشت: {item.note}</p>}
              <strong>{formatPrice(calculateItemTotal(item))}</strong>
            </div>
            <div className="qty">
              <button
                type="button"
                onClick={() => decrement(item.key)}
                disabled={item.quantity === 1}
                aria-label={`کم کردن ${item.titleSnapshotForUI}`}
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
      </section>
      <aside className="order-summary">
        <h2>خلاصه سفارش</h2>
        {couponCode ? (
          <div className="applied-coupon">
            <span>
              <strong>{couponCode}</strong>
              <small>اعتبارسنجی‌شده توسط سرور</small>
            </span>
            <button type="button" onClick={remove} aria-label="حذف کد تخفیف">
              <X />
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="discount">
              <span>کد تخفیف</span>
            </label>
            <div className="discount-field">
              <input
                id="discount"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="کد تخفیف"
              />
              <button
                type="button"
                onClick={apply}
                disabled={applying || !code.trim()}
              >
                {applying ? 'در حال بررسی…' : 'اعمال'}
              </button>
            </div>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
        <dl>
          <div>
            <dt>جمع سفارش</dt>
            <dd>{formatPrice(summary.subtotal)}</dd>
          </div>
          <div>
            <dt>تخفیف</dt>
            <dd>
              {summary.discount
                ? `− ${formatPrice(summary.discount)}`
                : '۰ تومان'}
            </dd>
          </div>
          <div>
            <dt>هزینه ارسال تقریبی</dt>
            <dd>{formatPrice(summary.deliveryFee)}</dd>
          </div>
        </dl>
        <div className="summary-total">
          <span>مبلغ نهایی</span>
          <strong>{formatPrice(summary.total)}</strong>
        </div>
        <Link href="/checkout" className="primary-button">
          ادامه و ثبت سفارش
        </Link>
        <small>هزینه نهایی با انتخاب نحوه دریافت به‌روز می‌شود.</small>
      </aside>
    </div>
  );
}
