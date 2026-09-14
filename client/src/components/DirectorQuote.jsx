import popcornBucket
  from "../images/popcorn-toggle.png";

function DirectorQuote({
  quote,
  director,
}) {
  return (
    <section className="director-quote-section">
      <div className="director-quote-decoration">
        <img
          src={popcornBucket}
          alt=""
          className="director-quote-popcorn"
        />
      </div>

      <blockquote className="director-quote-text">
        “{quote}”
      </blockquote>

      <div className="director-quote-name">
        — {director}
      </div>
    </section>
  );
}

export default DirectorQuote;