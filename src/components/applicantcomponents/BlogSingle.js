import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../services/ApplicantAPIService";
import "./BlogSingle.css";
import BackButton from "../common/BackButton";

export default function BlogSingle() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        const res = await axios.get(`${apiUrl}/blogs/getBlogById/${id}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        setBlog(res.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
      }
    }
    fetchBlog();
  }, [id]);

  const formatDate = (arr) => {
    if (!arr || arr.length < 6) return "";
    const [year, month, day, hour, min, sec] = arr;
    return new Date(year, month - 1, day, hour, min, sec).toLocaleDateString();
  };

  if (!blog) return <p className="loading-text">Loading...</p>;

  return (
    <div className="blog-single-container">
      {/* Blog Header */}
      <div className="blog-header">
        <div className="back-btn-wrapper-topsingle">
          <BackButton />
        <h1 className="blog-title-single">{blog.title}</h1>
</div>
        <p className="blog-meta">
          By <span className="author">{blog.author}</span> •{" "}
          {formatDate(blog.createdAt)}
        </p>
      </div>

      {/* Blog Layout */}
      <div className="blog-body">
        {/* Image floats right */}
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="blog-main-image"
        />

        {/* Text */}
        <div className="blog-content-single">
          {blog.content
            ?.split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, idx) => (
              <p
                key={idx}
                className={
                  line.startsWith("##")
                    ? "section-heading"
                    : line.startsWith("-")
                    ? "bullet-point"
                    : "paragraph"
                }
              >
                {line.replace(/^##\s*/, "").replace(/^-/, "").trim()}
              </p>
            ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="back-btn-wrapper">
        <Link to="/applicant-blog-list" className="back-btn">
          Back to Blogs
        </Link>
      </div>
    </div>
  );
}
