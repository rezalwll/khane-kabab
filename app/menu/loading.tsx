export default function Loading() {
  return (
    <main className="inner-page">
      <section className="page-hero">
        <div className="container">
          <h1>در حال آماده‌سازی منو...</h1>
        </div>
      </section>
      <section className="container menu-section">
        <div className="food-grid menu-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="skeleton-card" key={i}>
              <i />
              <span />
              <small />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
