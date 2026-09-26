'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCw, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};
type Product = {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceToman: number;
  compareAtPriceToman: number | null;
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  optionGroupIds: { id: string; sortOrder: number }[];
  images: {
    url: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
  }[];
};
type Option = {
  id: string;
  name: string;
  priceDeltaToman: number;
  sortOrder: number;
  isActive: boolean;
};
type Group = {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelect: number;
  maxSelect: number | null;
  sortOrder: number;
  isActive: boolean;
  options: Option[];
};
type Menu = {
  categories: Category[];
  products: Product[];
  optionGroups: Group[];
};
const blankProduct = {
  categoryId: '',
  slug: '',
  title: '',
  shortDescription: '',
  description: '',
  priceToman: 0,
  compareAtPriceToman: null as number | null,
  isActive: true,
  isAvailable: true,
  isFeatured: false,
  sortOrder: 0,
  optionGroupIds: [] as { id: string; sortOrder: number }[],
  images: [] as {
    url: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
  }[],
};
export default function AdminMenu() {
  const [data, setData] = useState<Menu | null>(null);
  const [tab, setTab] = useState<'products' | 'categories' | 'groups'>(
    'products',
  );
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<
    (typeof blankProduct & { id?: string }) | null
  >(null);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData((await adminApi.menu()) as Menu);
    } catch {
      setMessage('داده‌های منو دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const products = useMemo(
    () =>
      data?.products.filter(
        (p) =>
          (!search || p.title.includes(search)) &&
          (!categoryFilter || p.categoryId === categoryFilter),
      ) ?? [],
    [data, search, categoryFilter],
  );
  async function toggle(p: Product) {
    try {
      await adminApi.toggleAvailability(p.id, !p.isAvailable);
      await load();
    } catch {
      setMessage('تغییر موجودی ممکن نشد.');
    }
  }
  async function saveProduct(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    const { id, optionGroupIds, ...payload } = product;
    try {
      const result = id
        ? await adminApi.updateProduct<{ product: Product }>(id, payload)
        : await adminApi.createProduct<{ product: Product }>(payload);
      const productId = id ?? result.product.id;
      await adminApi.assignOptionGroups(productId, optionGroupIds);
      setProduct(null);
      setMessage('محصول ذخیره شد.');
      await load();
    } catch {
      setMessage('ذخیره محصول ممکن نشد.');
    }
  }
  async function categoryAction(existing?: Category) {
    const name = prompt('نام دسته', existing?.name ?? '');
    if (!name) return;
    const slug = prompt('اسلاگ انگلیسی', existing?.slug ?? '');
    if (!slug) return;
    const rawSort = prompt('ترتیب نمایش', String(existing?.sortOrder ?? 0));
    if (rawSort === null) return;
    try {
      const payload = {
        name,
        slug,
        description: existing?.description ?? null,
        sortOrder: Number(rawSort),
        isActive: existing?.isActive ?? true,
      };
      if (existing) await adminApi.updateCategory(existing.id, payload);
      else await adminApi.createCategory(payload);
      await load();
    } catch {
      setMessage('ذخیره دسته ممکن نشد.');
    }
  }
  async function groupAction(existing?: Group) {
    const name = prompt('نام گروه', existing?.name ?? '');
    if (!name) return;
    const selectionType = confirm('گروه تک‌انتخابی است؟')
      ? 'single'
      : 'multiple';
    const isRequired = confirm('انتخاب از این گروه اجباری است؟');
    const minSelect = Number(
      prompt('حداقل انتخاب', String(existing?.minSelect ?? 0)) ?? 0,
    );
    const maxRaw = prompt(
      'حداکثر انتخاب (خالی = بدون محدودیت)',
      existing?.maxSelect == null ? '' : String(existing.maxSelect),
    );
    try {
      const payload = {
        name,
        selectionType,
        isRequired,
        minSelect,
        maxSelect: maxRaw ? Number(maxRaw) : null,
        sortOrder: existing?.sortOrder ?? 0,
        isActive: existing?.isActive ?? true,
      };
      if (existing) await adminApi.updateOptionGroup(existing.id, payload);
      else await adminApi.createOptionGroup(payload);
      await load();
    } catch {
      setMessage('ذخیره گروه ممکن نشد.');
    }
  }
  async function optionAction(group: Group, existing?: Option) {
    const name = prompt('نام افزودنی', existing?.name ?? '');
    if (!name) return;
    const raw = prompt(
      'مابه‌التفاوت قیمت تومان',
      String(existing?.priceDeltaToman ?? 0),
    );
    if (raw === null) return;
    try {
      const payload = {
        name,
        priceDeltaToman: Number(raw),
        sortOrder: existing?.sortOrder ?? 0,
        isActive: existing ? confirm('این افزودنی فعال باشد؟') : true,
      };
      if (existing) await adminApi.updateOption(existing.id, payload);
      else await adminApi.createOption(group.id, payload);
      await load();
    } catch {
      setMessage('ذخیره افزودنی ممکن نشد.');
    }
  }
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>کاتالوگ زنده</span>
        <h1>مدیریت منو</h1>
        <p>دسته‌ها، غذاها و افزودنی‌ها بدون حذف داده</p>
      </div>
      <div className="admin-tabs">
        <button
          className={tab === 'products' ? 'active' : ''}
          onClick={() => setTab('products')}
        >
          محصولات
        </button>
        <button
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
        >
          دسته‌ها
        </button>
        <button
          className={tab === 'groups' ? 'active' : ''}
          onClick={() => setTab('groups')}
        >
          گروه‌های افزودنی
        </button>
      </div>
      {message && <div className="admin-notice">{message}</div>}
      {loading ? (
        <div className="admin-loading">در حال دریافت…</div>
      ) : (
        data &&
        tab === 'products' && (
          <>
            <div className="admin-toolbar">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جست‌وجوی غذا"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">همه دسته‌ها</option>
                {data.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button onClick={() => void load()}>
                <RefreshCw />
                تازه‌سازی
              </button>
              <button
                className="admin-primary"
                onClick={() =>
                  setProduct({
                    ...blankProduct,
                    categoryId: data.categories[0]?.id ?? '',
                  })
                }
              >
                <Plus />
                محصول
              </button>
            </div>
            <div className="admin-card-list">
              {products.map((p) => (
                <article key={p.id}>
                  <div>
                    <strong>{p.title}</strong>
                    <small>
                      {data.categories.find((c) => c.id === p.categoryId)?.name}{' '}
                      · {p.isActive ? 'فعال' : 'غیرفعال'}
                    </small>
                  </div>
                  <b>{formatPrice(p.priceToman)}</b>
                  <label>
                    <input
                      type="checkbox"
                      checked={p.isAvailable}
                      onChange={() => void toggle(p)}
                    />
                    موجود
                  </label>
                  <button
                    onClick={() =>
                      setProduct({
                        ...p,
                        optionGroupIds: p.optionGroupIds ?? [],
                      })
                    }
                  >
                    <Edit3 />
                    ویرایش
                  </button>
                </article>
              ))}
            </div>
          </>
        )
      )}
      {data && tab === 'categories' && (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>دسته‌ها</h2>
            <button
              className="admin-primary"
              onClick={() => void categoryAction()}
            >
              <Plus />
              دسته
            </button>
          </div>
          <div className="admin-card-list">
            {data.categories.map((c) => (
              <article key={c.id}>
                <div>
                  <strong>{c.name}</strong>
                  <small>
                    {c.slug} · ترتیب {c.sortOrder}
                  </small>
                </div>
                <span>{c.isActive ? 'فعال' : 'غیرفعال'}</span>
                <label>
                  <input
                    type="checkbox"
                    checked={c.isActive}
                    onChange={async () => {
                      await adminApi.updateCategory(c.id, {
                        isActive: !c.isActive,
                      });
                      await load();
                    }}
                  />
                  فعال
                </label>
                <button onClick={() => void categoryAction(c)}>
                  <Edit3 />
                  ویرایش
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {data && tab === 'groups' && (
        <section className="admin-panel">
          <div className="panel-heading">
            <h2>گروه‌های افزودنی</h2>
            <button
              className="admin-primary"
              onClick={() => void groupAction()}
            >
              <Plus />
              گروه
            </button>
          </div>
          {data.optionGroups.map((g) => (
            <div className="option-group" key={g.id}>
              <header>
                <span>
                  <strong>{g.name}</strong>
                  <small>
                    {g.selectionType === 'single' ? 'تک‌انتخابی' : 'چندانتخابی'}{' '}
                    · {g.isRequired ? 'اجباری' : 'اختیاری'}
                  </small>
                </span>
                <button onClick={() => void groupAction(g)}>
                  <Edit3 />
                </button>
                <button onClick={() => void optionAction(g)}>
                  <Plus />
                  افزودنی
                </button>
              </header>
              {g.options.map((o) => (
                <div key={o.id}>
                  <span>{o.name}</span>
                  <b>{formatPrice(o.priceDeltaToman)}</b>
                  <em>{o.isActive ? 'فعال' : 'غیرفعال'}</em>
                  <button onClick={() => void optionAction(g, o)}>
                    <Edit3 />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
      {product && data && (
        <dialog open className="admin-overlay">
          <form className="admin-modal" onSubmit={saveProduct}>
            <header>
              <h2>{product.id ? 'ویرایش محصول' : 'محصول جدید'}</h2>
              <button type="button" onClick={() => setProduct(null)}>
                <X />
              </button>
            </header>
            <div className="form-grid">
              <label>
                نام
                <input
                  required
                  maxLength={160}
                  value={product.title}
                  onChange={(e) =>
                    setProduct({ ...product, title: e.target.value })
                  }
                />
              </label>
              <label>
                اسلاگ
                <input
                  required
                  pattern="[a-z0-9-]+"
                  value={product.slug}
                  onChange={(e) =>
                    setProduct({ ...product, slug: e.target.value })
                  }
                />
              </label>
              <label>
                دسته
                <select
                  value={product.categoryId}
                  onChange={(e) =>
                    setProduct({ ...product, categoryId: e.target.value })
                  }
                >
                  {data.categories.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                قیمت تومان
                <input
                  type="number"
                  min="0"
                  value={product.priceToman}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      priceToman: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                قیمت قبلی (اختیاری)
                <input
                  type="number"
                  min="0"
                  value={product.compareAtPriceToman ?? ''}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      compareAtPriceToman:
                        e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="wide">
                آدرس تصویر اصلی
                <input
                  maxLength={1000}
                  placeholder="/images/foods/example.jpg"
                  value={product.images[0]?.url ?? ''}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      images: e.target.value
                        ? [
                            {
                              url: e.target.value,
                              altText: product.title || 'تصویر غذا',
                              sortOrder: 0,
                              isPrimary: true,
                            },
                          ]
                        : [],
                    })
                  }
                />
              </label>
              <label className="wide">
                توضیح کوتاه
                <input
                  maxLength={500}
                  value={product.shortDescription}
                  onChange={(e) =>
                    setProduct({ ...product, shortDescription: e.target.value })
                  }
                />
              </label>
              <label className="wide">
                توضیحات
                <textarea
                  maxLength={5000}
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                />
              </label>
              <label>
                ترتیب
                <input
                  type="number"
                  value={product.sortOrder}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </label>
              <div className="check-row">
                <label>
                  <input
                    type="checkbox"
                    checked={product.isActive}
                    onChange={(e) =>
                      setProduct({ ...product, isActive: e.target.checked })
                    }
                  />
                  فعال
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={product.isAvailable}
                    onChange={(e) =>
                      setProduct({ ...product, isAvailable: e.target.checked })
                    }
                  />
                  موجود
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={product.isFeatured}
                    onChange={(e) =>
                      setProduct({ ...product, isFeatured: e.target.checked })
                    }
                  />
                  ویژه
                </label>
              </div>
              <fieldset className="wide">
                <legend>گروه‌های افزودنی</legend>
                {data.optionGroups.map((g, index) => (
                  <label key={g.id}>
                    <input
                      type="checkbox"
                      checked={product.optionGroupIds.some(
                        (x) => x.id === g.id,
                      )}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          optionGroupIds: e.target.checked
                            ? [
                                ...product.optionGroupIds,
                                { id: g.id, sortOrder: index },
                              ]
                            : product.optionGroupIds.filter(
                                (x) => x.id !== g.id,
                              ),
                        })
                      }
                    />
                    {g.name}
                  </label>
                ))}
              </fieldset>
            </div>
            <footer>
              <button type="button" onClick={() => setProduct(null)}>
                انصراف
              </button>
              <button className="admin-primary">ذخیره محصول</button>
            </footer>
          </form>
        </dialog>
      )}
    </section>
  );
}
