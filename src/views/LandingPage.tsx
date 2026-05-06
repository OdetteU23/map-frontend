import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <section className="landing__card">
        {/* Hero section */}
        <div className="landing__hero">
          <div className="landing__hero-highlight">
            <h2 className="landing__hero-title">Löydä ja varaa tiloja helposti!</h2>
          </div>
          <div className="landing__hero-highlight">
            <p className="landing__hero-desc">
              {`Vuokraa studioita, juhlatiloja, tapahtumien tiloja e.g konsertteja, kokoustiloja, yritysten seminaarien ja konferenssien tiloja yhdestä paikasta`}
            </p>
          </div>
        </div>

        {/* CTA section */}
        <div className="landing__cta">
          <button className="btn btn--dark" onClick={() => navigate('/auth')}>
            Kirjaudu/Rekisteröidy ilmaiseksi
          </button>
          <button className="btn btn--light" onClick={() => navigate('/search')}>
            Selaa tiloja
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
