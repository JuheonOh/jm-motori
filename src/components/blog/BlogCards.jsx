import { useEffect, useState } from "react";
import { BLOG_URL } from "../../constants";
import { useRssPosts } from "../../hooks/useRssPosts";

const baseUrl = import.meta.env.BASE_URL;
const rssFallbackImage = `${baseUrl}assets/images/3.jpg`;
const INITIAL_VISIBLE_POSTS = 6;
const LOAD_MORE_STEP = 6;

export default function BlogCards() {
  const { posts, loading, error, refetch } = useRssPosts();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_POSTS);
  }, [posts.length]);

  if (loading) {
    return (
      <div className="rounded-[14px] border border-white/10 bg-[#15181b] px-4 py-9 text-center text-slate-400">
        <p>최신 정비 사례를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[14px] border border-rose-400/35 bg-rose-500/10 px-4 py-9 text-center text-rose-200">
        <p>
          최신 정비 사례를 자동으로 가져오지 못했습니다. 잠시 후 다시 시도하거나{" "}
          <a href={BLOG_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline">
            네이버 블로그
          </a>
          에서 직접 확인해 주세요.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#ffc107] px-4 py-3 text-[0.95rem] font-extrabold text-gray-900 shadow-[0_0_26px_rgba(255,193,7,0.25)] transition hover:brightness-95"
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
      <div className="grid grid-cols-3 gap-5 max-[980px]:grid-cols-2 max-[760px]:grid-cols-1">
        {visiblePosts.map((post) => (
          <article
            className="overflow-hidden rounded-[14px] border border-white/10 bg-[#15181b] transition hover:border-[#ffc107]/50"
            key={post.id}
          >
            <a href={post.link} target="_blank" rel="noopener noreferrer">
              <div className="aspect-16/10 overflow-hidden bg-slate-800">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    const img = event.currentTarget;
                    if (img.src !== rssFallbackImage) {
                      img.src = rssFallbackImage;
                    }
                  }}
                />
              </div>
              <div className="p-4">
                <div className="mb-2 flex justify-between gap-2 text-xs text-slate-500">
                  <span className="font-extrabold uppercase tracking-[0.16em] text-[#ffc107]">Repair Diary</span>
                  <span>{post.dateLabel}</span>
                </div>
                <h3 className="overflow-hidden text-[1.06rem] font-extrabold leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {post.title}
                </h3>
                <p className="mt-3 overflow-hidden text-[0.9rem] leading-relaxed text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                  {post.summary}
                </p>
                <span className="mt-4 inline-block text-[0.9rem] font-bold text-[#ffc107]">자세히 보기</span>
              </div>
            </a>
          </article>
        ))}
      </div>

      {posts.length > INITIAL_VISIBLE_POSTS && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">
            {visiblePosts.length} / {posts.length}건 표시 중
          </p>
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
              className="inline-flex items-center justify-center rounded-[10px] border border-[#ffc107]/45 bg-[#ffc107]/10 px-5 py-3 text-sm font-extrabold text-[#ffc107] transition hover:bg-[#ffc107]/20"
            >
              정비 사례 더보기
            </button>
          ) : (
            <p className="text-xs text-slate-500">모든 최신 사례를 확인했습니다.</p>
          )}
        </div>
      )}
    </>
  );
}
