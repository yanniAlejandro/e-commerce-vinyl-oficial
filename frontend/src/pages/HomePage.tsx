import { Link } from 'react-router-dom';

const MARQUEE = 'VINILO · LP · EDICIÓN LIMITADA · ANALÓGICO · qtb · SHOP · ';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__grid container">
          <div className="hero__copy">
            <p className="label hero__label">Disquera · Habana</p>
            <h1 className="hero__title">
              <span className="hero__title-serif">Sonido</span>
              <span className="hero__title-bold">en vinilo</span>
            </h1>
            <p className="hero__subtitle">
              Selección curada. Portadas que importan. Ediciones que no vuelven.
            </p>
            <div className="hero__actions">
              <Link to="/catalogo" className="btn btn--primary btn--lg">
                Ver shop
              </Link>
              <Link to="/catalogo?category=indie" className="link-arrow">
                Novedades →
              </Link>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__disc">
              <div className="hero__disc-inner" />
            </div>
            <p className="hero__visual-caption label">qtb records</p>
          </div>
        </div>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            <span>{MARQUEE.repeat(4)}</span>
            <span>{MARQUEE.repeat(4)}</span>
          </div>
        </div>
      </section>

      <section className="manifesto container">
        <p className="manifesto__text">
          No somos una tienda genérica. Somos una disquera con criterio —
          el mismo que usan los sellos que admiras.
        </p>
      </section>

      <section className="features container">
        <article className="feature">
          <span className="feature__num label">01</span>
          <h3>Curaduría</h3>
          <p>Cada disco pasa un filtro. Clásicos, rarezas y lo que suena ahora.</p>
        </article>
        <article className="feature">
          <span className="feature__num label">02</span>
          <h3>Ediciones</h3>
          <p>LP, EP y reediciones audiophile. Stock real, sin sorpresas.</p>
        </article>
        <article className="feature">
          <span className="feature__num label">03</span>
          <h3>Envío</h3>
          <p>Embalaje rígido. Tu vinilo llega como salió del sello.</p>
        </article>
      </section>

      <section className="home-cta container">
        <h2>Entra al catálogo</h2>
        <Link to="/catalogo" className="btn btn--outline btn--lg">
          Explorar todo
        </Link>
      </section>
    </>
  );
}
