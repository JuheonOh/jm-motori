import { BLOG_URL } from "../constants";
import BlogCards from "../components/blog/BlogCards";

export default function PortfolioSection({ containerClass }) {
  return (
    <section id="portfolio" className="portfolio-section">
      <div className={containerClass}>
        <div className="section-heading">
          <div><p className="section-kicker">02 / WORK LOG</p><h2>정비의 과정을 기록합니다.</h2><p className="section-description">JM모토리의 최근 정비 사례를 블로그 원문으로 만나보세요.</p></div>
          <a className="blog-link text-link" href={BLOG_URL} target="_blank" rel="noopener noreferrer">네이버 블로그 전체 보기 <span aria-hidden="true">↗</span></a>
        </div>
        <BlogCards />
      </div>
    </section>
  );
}
