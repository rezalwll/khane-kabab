'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getMenu } from '@/lib/api/menu';
import { apiProductToFood } from '@/lib/menu-adapter';
import type { Food } from '@/types/food';
import { FoodCard } from './food-card';
type MenuFilter = 'all' | 'featured' | 'available';
const normalize = (value: string) =>
  value.trim().replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLocaleLowerCase('fa-IR');

export function MenuBrowser() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('همه');
  const [filter, setFilter] = useState<MenuFilter>('all');
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>(['همه']);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeTab = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    getMenu()
      .then((data) => {
        if (!active) return;
        setLoadError('');
        const next = data.categories.flatMap((group) =>
          group.products.map((product) =>
            apiProductToFood(product, group.name),
          ),
        );
        setFoods(next);
        setCategories(['همه', ...data.categories.map((group) => group.name)]);
      })
      .catch((error) => {
        if (active)
          setLoadError(
            error instanceof Error ? error.message : 'خطا در دریافت منو',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('search')) {
        setQuery(params.get('search') ?? '');
        searchRef.current?.focus();
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    activeTab.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [category]);
  const shown = useMemo(() => {
    const normalized = normalize(query);
    return foods.filter(
      (food) =>
        (category === 'همه' || food.category === category) &&
        (!normalized ||
          normalize(`${food.title} ${food.shortDescription}`).includes(
            normalized,
          )) &&
        (filter !== 'featured' || food.featured) &&
        (filter !== 'available' || food.available),
    );
  }, [query, category, filter, foods]);
  if (loading)
    return (
      <div className="menu-browser">
        <div className="no-results">
          <h3>در حال دریافت منو…</h3>
          <p>لطفاً چند لحظه صبر کنید.</p>
        </div>
      </div>
    );
  if (loadError)
    return (
      <div className="menu-browser">
        <div className="no-results">
          <h3>منو دریافت نشد</h3>
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  return (
    <div className="menu-browser">
      <header className="menu-browser-heading">
        <span>انتخاب خوش‌طعم امروز</span>
        <h2>چی میل دارید؟</h2>
        <p>دسته‌بندی دلخواه را انتخاب کنید یا نام غذا را جستجو کنید.</p>
      </header>
      <div className="category-tabs" role="tablist" aria-label="دسته‌بندی غذاها">
        {categories.map((value) => (
          <button
            type="button"
            ref={value === category ? activeTab : undefined}
            role="tab"
            aria-selected={value === category}
            className={value === category ? 'active' : ''}
            onClick={() => setCategory(value)}
            key={value}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="menu-tools">
        <label className="search-box">
          <span className="sr-only">جستجوی غذا</span>
          <Search />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مثلاً چلوکباب کوبیده..."
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="پاک کردن جستجو"
            >
              <X />
            </button>
          )}
        </label>
        <div className="menu-filters" aria-label="فیلتر منو">
          {(
            [
              ['all', 'همه'],
              ['featured', 'پیشنهادها'],
              ['available', 'موجود'],
            ] as const
          ).map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={filter === value ? 'active' : ''}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="menu-results-heading">
        <div>
          <span>{category === 'همه' ? 'همه غذاها' : category}</span>
          <small>{shown.length.toLocaleString('fa-IR')} انتخاب</small>
        </div>
      </div>
      {shown.length ? (
        <div className="food-grid menu-grid">
          {shown.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <Search />
          <h3>غذایی پیدا نشد</h3>
          <p>جستجو یا فیلترها را تغییر دهید.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('همه');
              setFilter('all');
            }}
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}
