'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Check,
  Clock3,
  CreditCard,
  MapPin,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { cartItemsToApiLines } from '@/lib/cart-api';
import {
  createOrder,
  quoteOrder,
  startPayment,
  type ApiQuote,
} from '@/lib/api/orders';
import { getRestaurant, type ApiRestaurant } from '@/lib/api/restaurant';
import { useCart } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';
import { useGuestOrders } from '@/stores/guest-orders-store';
import type { DeliveryMethod, PaymentMethod } from '@/types/order';

const steps = ['نحوه دریافت', 'اطلاعات', 'زمان', 'پرداخت'];
const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
type Errors = { name?: string; mobile?: string; address?: string };

export function CheckoutFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [plaque, setPlaque] = useState('');
  const [unit, setUnit] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('on-delivery');
  const [errors, setErrors] = useState<Errors>({});
  const [quote, setQuote] = useState<ApiQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const clientOrderId = useRef<string>(crypto.randomUUID());
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);
  const couponCode = useOrderStore((state) => state.couponCode);
  const clearCoupon = useOrderStore((state) => state.clearCoupon);
  const addGuestOrder = useGuestOrders((state) => state.addOrder);
  const apiItems = useMemo(() => cartItemsToApiLines(items), [items]);
  useEffect(() => {
    let active = true;
    getRestaurant()
      .then(({ restaurant: value }) => {
        if (!active) return;
        setRestaurant(value);
        if (value && !value.deliveryEnabled && value.pickupEnabled)
          setDeliveryMethod('pickup');
      })
      .catch(
        (reason) =>
          active &&
          setSubmitError(
            reason instanceof Error
              ? reason.message
              : 'تنظیمات رستوران دریافت نشد.',
          ),
      )
      .finally(() => active && setLoadingSettings(false));
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!apiItems.length) return;
    let active = true;
    const timer = setTimeout(
      () =>
        quoteOrder({
          items: apiItems,
          fulfillmentType: deliveryMethod,
          ...(couponCode ? { couponCode } : {}),
        })
          .then((value) => {
            if (active) {
              setQuote(value);
              setQuoteError('');
            }
          })
          .catch((reason) => {
            if (active) {
              setQuote(null);
              setQuoteError(
                reason instanceof Error
                  ? reason.message
                  : 'قیمت نهایی دریافت نشد.',
              );
            }
          }),
      250,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [apiItems, deliveryMethod, couponCode]);
  const validateDetails = () => {
    const nextErrors: Errors = {};
    if (!customerName.trim())
      nextErrors.name = 'نام و نام خانوادگی را وارد کنید.';
    if (!/^09\d{9}$/.test(normalizeDigits(mobile).replace(/\s/g, '')))
      nextErrors.mobile = 'شماره موبایل را به شکل 09xxxxxxxxx وارد کنید.';
    if (deliveryMethod === 'delivery' && !address.trim())
      nextErrors.address = 'نشانی تحویل را وارد کنید.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const next = () => {
    if (step === 1 && !validateDetails()) return;
    setStep((value) => Math.min(3, value + 1));
  };
  const submit = async () => {
    if (!validateDetails()) {
      setStep(1);
      return;
    }
    if (!quote) {
      setSubmitError(quoteError || 'قیمت نهایی هنوز آماده نیست.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const finalQuote = await quoteOrder({
        items: apiItems,
        fulfillmentType: deliveryMethod,
        ...(couponCode ? { couponCode } : {}),
      });
      setQuote(finalQuote);
      const order = await createOrder({
        clientOrderId: clientOrderId.current,
        customer: {
          name: customerName.trim(),
          mobile: normalizeDigits(mobile).replace(/\s/g, ''),
        },
        fulfillmentType: deliveryMethod,
        paymentMethod:
          paymentMethod === 'on-delivery' ? 'on_delivery' : 'online',
        items: apiItems,
        ...(couponCode ? { couponCode } : {}),
        ...(deliveryTime !== 'asap' ? { requestedTime: deliveryTime } : {}),
        ...(deliveryMethod === 'delivery'
          ? {
              address: {
                address: address.trim(),
                plaque,
                unit,
                note: addressNote,
              },
            }
          : {}),
      });
      if (!order.trackingToken) throw new Error('کد پیگیری سفارش دریافت نشد.');
      addGuestOrder({
        publicNumber: order.publicNumber,
        trackingToken: order.trackingToken,
        createdAt: order.createdAt,
      });
      if (paymentMethod === 'online') {
        const payment = await startPayment(
          order.publicNumber,
          order.trackingToken,
        );
        clearCart();
        clearCoupon();
        window.location.assign(payment.redirectUrl);
        return;
      }
      clearCart();
      clearCoupon();
      router.push(
        `/order/success?order=${encodeURIComponent(order.publicNumber)}`,
      );
    } catch (reason) {
      setSubmitError(
        reason instanceof Error
          ? reason.message
          : 'ثبت سفارش ناموفق بود. دوباره تلاش کنید.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (!items.length)
    return (
      <div className="empty-cart checkout-empty">
        <ShoppingBag />
        <h2>برای ثبت سفارش، سبد خریدتان خالی است</h2>
        <p>ابتدا غذای دلخواه را از منو انتخاب کنید.</p>
        <Link href="/menu" className="primary-button">
          مشاهده منو
        </Link>
      </div>
    );
  if (loadingSettings)
    return (
      <div className="empty-cart checkout-empty">
        <h2>در حال آماده‌سازی ثبت سفارش…</h2>
      </div>
    );
  if (!restaurant || !restaurant.ordersEnabled)
    return (
      <div className="empty-cart checkout-empty">
        <h2>ثبت سفارش فعلاً متوقف است</h2>
        <p>{submitError || 'لطفاً بعداً دوباره تلاش کنید.'}</p>
      </div>
    );
  return (
    <div className="checkout-grid">
      <div>
        <ol className="steps" aria-label="مراحل ثبت سفارش">
          {steps.map((label, index) => (
            <li
              className={index <= step ? 'active' : ''}
              aria-current={index === step ? 'step' : undefined}
              key={label}
            >
              <i>
                {index < step ? <Check /> : (index + 1).toLocaleString('fa-IR')}
              </i>
              <span>{label}</span>
            </li>
          ))}
        </ol>
        <section className="checkout-card">
          {step === 0 && (
            <>
              <h2>نحوه دریافت سفارش</h2>
              <p>سفارش را چطور دریافت می‌کنید؟</p>
              <div className="choice-grid">
                {restaurant.deliveryEnabled && (
                  <button
                    type="button"
                    className={deliveryMethod === 'delivery' ? 'selected' : ''}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <Bike />
                    <strong>ارسال با پیک</strong>
                    <small>هزینه دقیق از سرور محاسبه می‌شود</small>
                  </button>
                )}
                {restaurant.pickupEnabled && (
                  <button
                    type="button"
                    className={deliveryMethod === 'pickup' ? 'selected' : ''}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <Store />
                    <strong>دریافت حضوری</strong>
                    <small>بدون هزینه ارسال</small>
                  </button>
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2>
                اطلاعات {deliveryMethod === 'delivery' ? 'تحویل' : 'دریافت‌کننده'}
              </h2>
              <div className="form-grid">
                <label>
                  <span>نام و نام خانوادگی</span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                  {errors.name && (
                    <small className="field-error">{errors.name}</small>
                  )}
                </label>
                <label>
                  <span>شماره موبایل</span>
                  <input
                    dir="ltr"
                    inputMode="tel"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="09123456789"
                  />
                  {errors.mobile && (
                    <small className="field-error">{errors.mobile}</small>
                  )}
                </label>
                {deliveryMethod === 'delivery' ? (
                  <>
                    <label className="full">
                      <span>آدرس دقیق</span>
                      <textarea
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                      />
                      {errors.address && (
                        <small className="field-error">{errors.address}</small>
                      )}
                    </label>
                    <label>
                      <span>پلاک</span>
                      <input
                        value={plaque}
                        onChange={(event) => setPlaque(event.target.value)}
                      />
                    </label>
                    <label>
                      <span>واحد</span>
                      <input
                        value={unit}
                        onChange={(event) => setUnit(event.target.value)}
                      />
                    </label>
                    <label className="full">
                      <span>توضیحات نشانی</span>
                      <input
                        value={addressNote}
                        onChange={(event) => setAddressNote(event.target.value)}
                      />
                    </label>
                  </>
                ) : (
                  <div className="pickup-note full">
                    <Store />
                    <div>
                      <strong>
                        دریافت حضوری از {restaurant.restaurantName}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2>زمان دریافت</h2>
              <div className="time-options">
                <button
                  type="button"
                  className={deliveryTime === 'asap' ? 'selected' : ''}
                  onClick={() => setDeliveryTime('asap')}
                >
                  <Clock3 />
                  <span>
                    <strong>سریع‌ترین زمان ممکن</strong>
                  </span>
                </button>
                <label>
                  <span>یا ساعت موردنظر</span>
                  <select
                    value={deliveryTime}
                    onChange={(event) => setDeliveryTime(event.target.value)}
                  >
                    <option value="asap">سریع‌ترین زمان</option>
                    <option value="13:30">۱۳:۳۰</option>
                    <option value="14:00">۱۴:۰۰</option>
                    <option value="14:30">۱۴:۳۰</option>
                  </select>
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2>روش پرداخت</h2>
              <div className="payment-options">
                <label
                  className={
                    !restaurant.capabilities.onlinePayment ? 'disabled' : ''
                  }
                >
                  <input
                    name="pay"
                    type="radio"
                    disabled={!restaurant.capabilities.onlinePayment}
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <CreditCard />
                  <span>
                    <strong>پرداخت آنلاین</strong>
                    <small>
                      {restaurant.capabilities.onlinePayment
                        ? 'آماده است'
                        : 'درگاه هنوز متصل نیست'}
                    </small>
                  </span>
                </label>
                <label
                  className={paymentMethod === 'on-delivery' ? 'selected' : ''}
                >
                  <input
                    name="pay"
                    type="radio"
                    checked={paymentMethod === 'on-delivery'}
                    onChange={() => setPaymentMethod('on-delivery')}
                  />
                  <MapPin />
                  <span>
                    <strong>پرداخت هنگام دریافت</strong>
                    <small>فعال</small>
                  </span>
                </label>
              </div>
            </>
          )}
          {submitError && (
            <p className="field-error" role="alert">
              {submitError}
            </p>
          )}
          <div className="step-actions">
            {step > 0 && (
              <button
                type="button"
                className="back-button"
                onClick={() => setStep((value) => value - 1)}
              >
                مرحله قبل
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="primary-button" onClick={next}>
                ادامه
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting || !quote}
                className="primary-button"
              >
                {submitting ? 'در حال ثبت…' : 'ثبت نهایی سفارش'}
              </button>
            )}
          </div>
        </section>
      </div>
      <aside className="order-summary checkout-summary">
        <h2>خلاصه سفارش</h2>
        <div className="mini-items">
          {items.map((item, itemIndex) => (
            <div key={item.key}>
              <div className="mini-item-image">
                <Image
                  src={item.imageSnapshotForUI}
                  alt=""
                  fill
                  unoptimized
                  sizes="46px"
                />
              </div>
              <span>
                {item.titleSnapshotForUI}
                <small>{item.quantity.toLocaleString('fa-IR')} عدد</small>
              </span>
              <strong>
                {quote
                  ? formatPrice(quote.lines[itemIndex]?.lineTotalToman ?? 0)
                  : '…'}
              </strong>
            </div>
          ))}
        </div>
        {quote ? (
          <>
            <dl>
              <div>
                <dt>جمع سفارش</dt>
                <dd>{formatPrice(quote.subtotalToman)}</dd>
              </div>
              <div>
                <dt>تخفیف</dt>
                <dd>{formatPrice(quote.discountToman)}</dd>
              </div>
              <div>
                <dt>ارسال</dt>
                <dd>
                  {quote.deliveryFeeToman
                    ? formatPrice(quote.deliveryFeeToman)
                    : 'رایگان'}
                </dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>مبلغ نهایی</span>
              <strong>{formatPrice(quote.totalToman)}</strong>
            </div>
          </>
        ) : (
          <p className="field-error">
            {quoteError || 'در حال محاسبه قیمت نهایی…'}
          </p>
        )}
      </aside>
    </div>
  );
}
