'use client';
import { useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { useCart } from '@/stores/cart-store';
import { useToastStore } from '@/stores/toast-store';
import type { Addon, Food } from '@/types/food';

export function ProductOrder({ food }: { food: Food }) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Addon[]>([]);
  const [note, setNote] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const addItem = useCart((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);
  const total = useMemo(
    () =>
      (food.price + selected.reduce((sum, addon) => sum + addon.price, 0)) *
      quantity,
    [food.price, selected, quantity],
  );
  const toggle = (addon: Addon) =>
    setSelected((current) => {
      const group = food.optionGroups?.find(
        (value) => value.id === addon.groupId,
      );
      if (current.some((value) => value.id === addon.id))
        return current.filter((value) => value.id !== addon.id);
      if (group?.selectionType === 'single')
        return [
          ...current.filter((value) => value.groupId !== group.id),
          addon,
        ];
      const inGroup = current.filter(
        (value) => value.groupId === group?.id,
      ).length;
      if (
        group?.maxSelect !== null &&
        group?.maxSelect !== undefined &&
        inGroup >= group.maxSelect
      )
        return current;
      return [...current, addon];
    });
  const add = () => {
    if (!food.available) return;
    const invalid = food.optionGroups?.find(
      (group) =>
        selected.filter((value) => value.groupId === group.id).length <
        Math.max(group.minSelect, group.isRequired ? 1 : 0),
    );
    if (invalid) {
      setSelectionError(
        `از بخش «${invalid.name}» حداقل ${Math.max(invalid.minSelect, 1).toLocaleString('fa-IR')} مورد انتخاب کنید.`,
      );
      return;
    }
    setSelectionError('');
    addItem(food, quantity, selected, note);
    showToast(`${food.title} به سبد خرید اضافه شد`);
  };
  return (
    <div className="product-info">
      {food.tags[0] && <span className="product-badge">{food.tags[0]}</span>}
      <h1>{food.title}</h1>
      <p>{food.fullDescription}</p>
      <strong className="product-price">{formatPrice(food.price)}</strong>
      <hr />
      <div className="product-row">
        <div>
          <h2>تعداد</h2>
          <small>حداقل یک پرس</small>
        </div>
        <div className="qty large" aria-label="انتخاب تعداد">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity === 1}
            aria-label="کم کردن تعداد"
          >
            <Minus />
          </button>
          <output aria-live="polite">{quantity.toLocaleString('fa-IR')}</output>
          <button
            type="button"
            onClick={() => setQuantity((value) => value + 1)}
            aria-label="زیاد کردن تعداد"
          >
            <Plus />
          </button>
        </div>
      </div>
      {(food.optionGroups?.length ?? 0) > 0 && (
        <>
          <hr />
          <fieldset className="addons">
            <legend>انتخاب‌های غذا</legend>
            {food.optionGroups?.map((group) => (
              <div key={group.id}>
                <p>
                  <strong>{group.name}</strong>
                  {group.isRequired ? ' — الزامی' : ' — اختیاری'}
                </p>
                <div>
                  {group.options.map((addon) => {
                    const checked = selected.some(
                      (value) => value.id === addon.id,
                    );
                    return (
                      <label
                        key={addon.id}
                        className={checked ? 'checked' : ''}
                      >
                        <input
                          type={
                            group.selectionType === 'single'
                              ? 'radio'
                              : 'checkbox'
                          }
                          name={`option-${group.id}`}
                          checked={checked}
                          onChange={() => toggle(addon)}
                        />
                        <i aria-hidden="true">{checked && <Check />}</i>
                        <span>{addon.title}</span>
                        <strong>+ {formatPrice(addon.price)}</strong>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            {selectionError && (
              <p className="field-error" role="alert">
                {selectionError}
              </p>
            )}
          </fieldset>
        </>
      )}
      <label className="chef-note">
        <span>
          توضیحات برای آشپزخانه <small>(اختیاری)</small>
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={160}
          placeholder="مثلاً برنج کم‌روغن باشد..."
        />
      </label>
      <button
        type="button"
        className="primary-button add-main"
        onClick={add}
        disabled={!food.available}
      >
        <ShoppingBag />
        {food.available ? 'افزودن به سبد' : 'فعلاً ناموجود'}
        <strong>{formatPrice(total)}</strong>
      </button>
      <div className="mobile-product-cta">
        <span>
          <small>مبلغ این انتخاب</small>
          <strong>{formatPrice(total)}</strong>
        </span>
        <button type="button" onClick={add} disabled={!food.available}>
          <ShoppingBag />
          {food.available ? 'افزودن' : 'ناموجود'}
        </button>
      </div>
    </div>
  );
}
