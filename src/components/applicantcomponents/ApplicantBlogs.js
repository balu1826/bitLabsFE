import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useLocation } from "react-router-dom";
import "./ApplicantBlog.css";
import ExploreButton from "../../images/icons/ExploreButton.svg";
import noblogsfound from "../../images/empty-state-images/no-blogs-found.png";
import nosearchresults from "../../images/empty-state-images/no-search-results.png";

export default function ApplicantBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const lastFocused = useRef(null);
  const location = useLocation();
  const hasAutoOpened = useRef(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        if (page === 0) {
          setLoading(true);
        }
        const res = await axios.get(
          `${apiUrl}/blogs/active?page=${page}&size=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );

        const newBlogs = res.data.content || res.data || [];

        if (!ignore) {
          if (page === 0) {
            setBlogs(newBlogs);
          } else {
            setBlogs((prev) => [...prev, ...newBlogs]);
          }
          setHasMore(!res.data.last && newBlogs.length >= pageSize);
        }
      } catch (e) {
        console.error("Error fetching blogs:", e);
        setError(
          "Failed to load blogs. Please check your connection or try again later."
        );
        setHasMore(false);
      } finally {
        //  setTimeout(()=>setLoading(false),2000);//
        setLoading(false);
      }
    })();
  }, [page]);

  const filteredBlogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [blogs, query]);

  const formatDate = (arr) => {
    if (!arr || arr.length < 6) return "";
    const [y, m, d, h, mi, s] = arr;
    return new Date(y, m - 1, d, h, mi, s).toLocaleDateString();
  };

  // Modal controls
  const openModal = (blog) => {
    lastFocused.current = document.activeElement;
    setSelected(blog);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setSelected(null);
    document.body.style.overflow = "";
    lastFocused.current?.focus?.();
  };
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const blogId = params.get("blog");
    if (!blogId || !blogs.length || selected || hasAutoOpened.current) return;

    const blog = blogs.find((b) => String(b.id) === blogId);
    if (blog) {
      hasAutoOpened.current = true;
      setTimeout(() => openModal(blog), 0);
      window.history.replaceState({}, "", "/applicant-blog-list");
    }
  }, [blogs, location.search, selected, openModal]);
  useEffect(() => {
    return () => {
      hasAutoOpened.current = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && selected && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);
  const BlogSkeleton = ({ count = 12 }) => {
    return (
      <div className="tv-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="tv-card">
            {/* Thumbnail Skeleton */}
            <div className="tv-media">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#e5e7eb",
                  borderRadius: "5px",
                }}
              />
            </div>

            <div className="tv-content">
              {/* Title Skeleton (1.5 lines) */}
              <div
                style={{
                  width: "85%",
                  height: "18px",
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              />
              <div
                style={{
                  width: "55%",
                  height: "18px",
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  marginTop: "6px",
                }}
              />

              {/* Footer Row */}
              <div className="tv-footer">
                {/* Author + Date Skeleton */}
                <div className="tv-meta">
                  <div
                    style={{
                      width: "120px",
                      height: "12px",
                      background: "#e5e7eb",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                {/* Read More Icon Skeleton */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    background: "#e5e7eb",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border-style">
      <div className="blur-border-style"></div>
      <div className="dashboard__content">
        {/* Title + Search */}
        <div className="row extraSpace">
          <div className="col-lg-12 col-md-12">
            <div className="main-header-row">
              <h1 className="main-heading">Tech vibes</h1>

              <div className="hackathon-search-box">
                <i className="fa fa-search search-icon1"></i>
                <input
                  type="text"
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="hackathon-search-input"
                />
                {query && (
                  <i
                    className="fa fa-times clear-icon"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setQuery("")}
                  ></i>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="blogs-container" style={{ width: "100%" }}>
          {loading && page === 0 ? (
            <BlogSkeleton count={12} />
          ) : filteredBlogs.length === 0 ? (
            blogs.length === 0 ? (
              // CASE 1: No blogs in DB
              <div
                className="no-blogs-wrapper"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh",
                  textAlign: "center",
                }}
              >
                <img
                  src={noblogsfound}
                  width="400"
                  // height="auto"
                  style={{ marginBottom: "10px" }}
                />
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#555",
                    fontStyle: "sans-serif",
                  }}
                >
                  No blogs available yet
                </p>
              </div>
            ) : (
              // CASE 2: Searching but no results

              <div
                className="no-blogs-wrapper"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  height: "60vh",
                  textAlign: "center",
                  // backgroundColor: "#fff",
                }}
              >
                <img
                  src={nosearchresults}
                  width="500"
                  height="400"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    height: "auto",
                    minWidth: "120px",
                  }}
                />
                <p
                  style={{
                    fontWeight: "500",
                    fontStyle: "sans-serif",
                    fontSize: "18px",
                  }}
                >
                  No results found for your search
                </p>
              </div>
            )
          ) : (
            <>
              {/* Blog Grid */}
              <div className="tv-grid">
                {filteredBlogs.map((b) => (
                  <article
                    key={b.id}
                    className="tv-card"
                    onClick={() => openModal(b)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && openModal(b)
                    }
                  >
                    <div className="tv-media">
                      <img src={b.imageUrl} alt={b.title} loading="lazy" />
                    </div>

                    <div className="tv-content">
                      <h4 className="tv-card-title">{b.title}</h4>

                      <div className="tv-footer">
                        <div className="tv-meta">
                          <span className="tv-by">
                            By {b.author || "bitLabs"}
                          </span>
                          <span className="tv-dot">•</span>
                          <span className="tv-date">
                            {formatDate(b.createdAt)}
                          </span>
                        </div>

                        <button
                          className="tv-open"
                          title="Read More"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(b);
                          }}
                          dangerouslySetInnerHTML={{
                            __html: `
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                        <path d="M18,10.82a1,1,0,0,0-1,1V19a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V8A1,1,0,0,1,5,7h7.18a1,1,0,1,0,0-2H5A3,3,0,0,0,2,8V19a3,3,0,0,0,3,3H16a3,3,0,0,0,3-3V11.82A1,1,0,0,0,18,10.82Zm3.92-8.2A1.015,1.015,0,0,0,21,2H15a1,1,0,0,0,0,2h3.59L8.29,14.29a1,1,0,1,0,1.42,1.42L20,5.41V9a1,1,0,0,0,2,0V3a1,1,0,0,0-.08-.38Z" fill="#e87316"/>
                      </svg>
                    `,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {loading && page > 0 && <BlogSkeleton count={6} />}

              {/* Load More Button (Hidden While Searching) */}
            </>
          )}

          {/* {=========} */}
          {hasMore && query.trim() === "" && !loading && (
            <div className="load-more-container">
              <span
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px",
                }}
              >
                <img
                  src={ExploreButton}
                  alt="Load more"
                  onClick={() => handleLoadMore()}
                />
              </span>
            </div>
          )}
        </div>

        {/* Popup Modal */}
        {selected && (
          <div
            className="tv-modal-overlay"
            onClick={closeModal}
            aria-modal="true"
            role="dialog"
          >
            <div className="tv-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="tv-modal-close"
                onClick={closeModal}
                aria-label="Close"
                dangerouslySetInnerHTML={{
                  __html: `
   <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<circle cx="12" cy="12" r="9" fill="#2A4157" fill-opacity="0.24"/>
<path d="M16 8L8 16" stroke="#222222" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 8L16 16" stroke="#222222" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

    `,
                }}
              ></button>

              <div className="tv-modal-header">
                <div className="tv-modal-thumb">
                  <img src={selected.imageUrl} alt={selected.title} />
                </div>
                <div className="tv-modal-headtext">
                  <h3 className="tv-modal-title">{selected.title}</h3>
                  <div className="tv-meta">
                    <span className="tv-by">
                      By {selected.author || "bitLabs"}
                    </span>
                    <span className="tv-dot">•</span>
                    <span className="tv-date">
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tv-modal-body">
                {selected.description && (
                  <p className="tv-modal-desc">{selected.description}</p>
                )}
                {selected.content && (
                  <div className="tv-modal-content">
                    {selected.content
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => (
                        <p
                          key={i}
                          className={
                            line.startsWith("##")
                              ? "tv-h2"
                              : line.startsWith("-")
                              ? "tv-bullet"
                              : "tv-p"
                          }
                        >
                          {line
                            .replace(/^##\s*/, "")
                            .replace(/^-/, "")
                            .trim()}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
