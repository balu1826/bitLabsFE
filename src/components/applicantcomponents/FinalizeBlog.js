import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from '../../services/ApplicantAPIService';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function FinalizeBlog() {
    const [blogs, setBlogs] = useState([]);
    const [showFullBlog, setShowFullBlog] = useState(false)
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [authorName, setAuthorName] = useState("");

    const handleReadMore = (id) => {
        setSelectedBlogId(id);
        setShowFullBlog(true);
    };

    const handleConfirmPopup = (id) => {
        setSelectedBlogId(id);
        setShowConfirmPopup(true);
    };

    const handleClosePopup = () => {
        setShowConfirmPopup(false);
        setAuthorName("");
    };

    const handleSubmit = async (name, status, id) => {
        const blogId = id || selectedBlogId;
        console.log(name, status, selectedBlogId, id)
        const body = {
            isActive: status,
            id: id || selectedBlogId,
            author: name || "Admin",
        };
        console.log(body)
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const res = await axios.put(`${apiUrl}/blogs/updateOrDelete`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );
             if (res.status === 200) {
                console.log(blogs)
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      toast.success("blog status changed")
    }
        } catch (err) {
            console.error("Error fetching blogs:", err);
            toast.error("error while changing the status")
        }
         setShowConfirmPopup(false);
    };


    const spanStyle = {
        color: 'white',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: '15px',
        fontWeight: '600',
    };

    const linkStyle = {
        backgroundColor: '#F97316',
        display: 'inline-block',
    };

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const jwtToken = localStorage.getItem('jwtToken');
                const res = await axios.get(`${apiUrl}/blogs/inactive`,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    }
                );
                setBlogs(res.data);
            } catch (err) {
                console.error("Error fetching blogs:", err);
            }
        }
        fetchBlogs();
    }, []);

    const formatDate = (arr) => {
        if (!arr || arr.length < 6) return "";
        const [year, month, day, hour, min, sec] = arr;
        return new Date(year, month - 1, day, hour, min, sec).toLocaleString();
    };

    return (
        <div className="dashboard__content blogs-page">
            <div className="row justify-content-center extraSpace">
                <div className="col-lg-10 col-md-12">

                    <div className="themes-container">
                        <div className="title-dashboard">
                            <div className="title-dash flex2" style={{ fontSize: '30px', fontWeight: 'bold', margin: '3%' }}>Confirm the Blogs</div>
                        </div>
                    </div>

                    {/* Blog Cards */}
                    {!showFullBlog && blogs.map((blog) => (
                        <div key={blog.id} className="card mb-4 shadow-sm blog-card blog-layout">
                            <div className="row g-0 flex-column flex-md-row">
                                <div className="col-md-4">
                                    <img
                                        src={blog.imageUrl}
                                        className="img-fluid rounded-start blog-img"
                                        alt={blog.title}
                                    />
                                </div>

                                <div className="col-md-8">
                                    <div className="card-body blog-card-body">
                                        <div>
                                            <h5 className="card-title blog-title" style={{ fontSize: '23px' }}>{blog.title}</h5>
                                            <p className="card-text text-muted">{blog.description}</p>
                                        </div>
                                        <small className="auther">
                                            {blog.author} • {formatDate(blog.createdAt)}
                                        </small>
                                        <div className="blog-footer" style={{ display: 'flex', justifyContent: 'space-around' }}>
                                            <div className="resumecard-button" onClick={() => handleReadMore(blog.id)}>
                                                <Link
                                                    rel="noopener noreferrer"
                                                    className="button-link1"
                                                    style={linkStyle}
                                                >
                                                    <span className="button button-custom" style={spanStyle}>
                                                        Read More
                                                    </span>
                                                </Link>
                                            </div>
                                            <div className="resumecard-button" onClick={() => handleConfirmPopup(blog.id)}>
                                                <Link
                                                    rel="noopener noreferrer"
                                                    className="button-link1"
                                                    style={linkStyle}
                                                >
                                                    <span className="button button-custom" style={spanStyle}>
                                                        update
                                                    </span>
                                                </Link>
                                            </div>
                                            <div className="resumecard-button" onClick={() => handleSubmit(authorName, false, blog.id)}>
                                                <Link
                                                    rel="noopener noreferrer"
                                                    className="button-link1"
                                                    style={linkStyle}
                                                >
                                                    <span className="button button-custom" style={spanStyle}>
                                                        delete
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {showConfirmPopup && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100vw",
                                height: "100vh",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1000,
                            }}
                        >
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "8px",
                                    width: "550px",
                                    maxWidth: "90%",
                                    height: '250px',
                                    padding: "18px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h5 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>Update Author</h5>
                                    <button
                                        onClick={handleClosePopup}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            fontSize: "20px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>

                                {/* Body */}
                                <div style={{ marginTop: "12px" }}>
                                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
                                        Author Name
                                    </label>
                                    <input
                                        type="text"
                                        value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        placeholder="Enter author name"
                                        style={{
                                            width: "100%",
                                            padding: "8px",
                                            borderRadius: "4px",
                                            border: "1px solid #ccc",
                                            fontSize: "14px",
                                            height: "36px",
                                        }}
                                    />
                                </div>

                                {/* Footer */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: "8px",
                                        marginTop: "36px",
                                    }}
                                >
                                    <button
                                        onClick={handleClosePopup}
                                        style={{
                                            padding: "6px 14px",
                                            background: "#6c757d",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleSubmit(authorName, true)}
                                        style={{
                                            padding: "6px 14px",
                                            background: "#F97316",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Full Blog */}
                    {showFullBlog && selectedBlogId && (
                        <div className="card mb-4 shadow-sm blog-card full-blog blog-layout">
                            {blogs
                                .filter((b) => b.id === selectedBlogId)
                                .map((blog) => (
                                    <div key={blog.id}>
                                        <h2 className="blog-title" style={{ fontSize: '25px' }}>{blog.title}</h2>
                                        <p className="text-muted">{blog.description}</p>

                                        <img
                                            src={blog.imageUrl}
                                            alt={blog.title}
                                            className="img-fluid blog-img1 mb-3"
                                        />

                                        <p>{blog.content}</p>

                                        <small className="auther d-block mt-3">
                                            {blog.author} • {formatDate(blog.createdAt)}
                                        </small>

                                        <div
                                            className="resumecard-button mt-3"
                                            onClick={() => setShowFullBlog(false)}
                                        >
                                            <Link
                                                rel="noopener noreferrer"
                                                className="button-link1"
                                                style={linkStyle}
                                            >
                                                <span className="button button-custom" style={spanStyle}>
                                                    Back
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );

}
