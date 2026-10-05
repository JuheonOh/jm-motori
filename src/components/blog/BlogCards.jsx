import { useEffect, useState } from "react";
import { BLOG_URL } from "../../constants";
import { useRssPosts } from "../../hooks/useRssPosts";

const MOBILE_QUERY = "(max-width: 760px)";

export default function BlogCards() {
  const { posts, loading, error, refetch } = useRssPosts();
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const pageSize = isMobile ? 3 : 6;
  const [expandedCount, setExpandedCount] = useState(0);
  const visibleCount = Math.max(pageSize, expandedCount);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setExpandedCount(0);
  }, [posts.length]);

  if (loading) {
    return (
      <div className="rounded-[14px] border border-black/10 bg-black/5 px-4 py-9 text-center text-[#626963]">
        <p>최신 정비 사례를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-rose-400/35 bg-rose-500/10 px-4 py-9 text-center text-rose-800">
        <p>
          최신 정비 사례를 자동으로 가져오지 못했습니다. 잠시 후 다시 시도하거나{" "}
          <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            네이버 블로그
          </a>
          에서 직접 확인해 주세요.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-4 py-3 text-[0.95rem] font-extrabold text-gray-900 transition hover:brightness-95"
          onClick={refetch}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <>
      <div className="case-grid">
        {visiblePosts.map((post) => (
          <article className="repair-case" key={post.id}>
            <a className="case-link" href={post.link} target="_blank" rel="noopener noreferrer" title={post.title}>
              <div className="case-photo">
                <img
                  key={post.thumbnail}
                  src={post.thumbnail}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  hidden={post.thumbnail === `${import.meta.env.BASE_URL}assets/images/3.jpg`}
                  onError={(event) => { event.currentTarget.hidden = true; }}
                />
                <span className="photo-fallback">썸네일을 불러오지 못했습니다</span>
              </div>
              <div className="case-body">
                <h3>{post.title}</h3>
                <div className="case-footer">
                  <span>{post.dateLabel}</span>
                  <span>정비 기록 보기 <span aria-hidden="true">↗</span></span>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>

      {posts.length > pageSize && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-[#626963]">
            {visiblePosts.length} / {posts.length}건 표시 중
          </p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpandedCount(visibleCount + pageSize)}
              className="inline-flex items-center justify-center rounded-[10px] border border-current/30 bg-transparent px-5 py-3 text-sm font-extrabold text-current transition hover:bg-black/5"
            >
              정비 사례 더보기
            </button>
          )}
        </div>
      )}
    </>
  );
}
