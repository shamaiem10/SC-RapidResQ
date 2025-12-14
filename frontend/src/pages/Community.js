import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Phone,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { handlePanicButton } from "../utils/panicButton";
import "./Community.css";

function CommunityBoard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: "Blood Needed",
    title: "",
    description: "",
    location: "",
    phone: "",
    author: "",
    urgent: false
  });

  const filters = [
    { id: "All", label: "All" },
    { id: "Blood Needed", label: "Blood Needed" },
    { id: "Missing Person", label: "Missing Person" },
    { id: "Medical Emergency", label: "Medical Emergency" },
    { id: "Shelter Needed", label: "Shelter Needed" },
    { id: "Food / Water", label: "Food / Water" },
    { id: "Disaster Help", label: "Disaster Help" },
    { id: "Urgent", label: "Urgent Only" }
  ];

  // Calculate time ago from timestamp
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/community/posts";
      
      // Build query parameters for filtering (handled by backend)
      const params = new URLSearchParams();
      if (activeFilter !== "All") {
        if (activeFilter === "Urgent") {
          params.append("urgent", "true");
        } else {
          params.append("type", activeFilter);
        }
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Format posts with timeAgo (only formatting, no business logic)
        const formattedPosts = data.posts.map(post => ({
          ...post,
          timeAgo: getTimeAgo(post.createdAt)
        }));
        setPosts(formattedPosts);
      } else {
        console.error("Error fetching posts:", data.message);
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  // Fetch posts on component mount and when filter changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle filter change
  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  // Open WhatsApp chat immediately
  const openWhatsApp = (phone, postTitle = "", postLocation = "") => {
    if (!phone) return;
    let cleanNumber = phone.replace(/\D/g, "");
    
    // Ensure the number has country code for WhatsApp
    // If number starts with 0, remove it (common in some countries)
    if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1);
    }
    
    // If number doesn't start with country code and is 10 digits, assume Pakistan (92)
    // Pakistan numbers are typically 10 digits after country code
    if (cleanNumber.length === 10 && !cleanNumber.startsWith('92')) {
      cleanNumber = '92' + cleanNumber;
    }
    // If number is 11 digits and starts with 9 (Pakistan mobile), add country code
    else if (cleanNumber.length === 11 && cleanNumber.startsWith('9') && !cleanNumber.startsWith('92')) {
      cleanNumber = '92' + cleanNumber;
    }
    // If number is less than 10 digits, it's invalid
    else if (cleanNumber.length < 10) {
      alert('Invalid phone number format');
      return;
    }
    
    // Create a pre-filled message
    let message = "Hello, I saw your emergency post";
    if (postTitle) {
      message += ` about "${postTitle}"`;
    }
    if (postLocation) {
      message += ` in ${postLocation}`;
    }
    message += ". How can I help?";
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Handle form submission
  const handleSubmitPost = async (e) => {
    e.preventDefault();

    // Basic client-side validation (backend will also validate)
    if (!formData.type || !formData.title || !formData.description || !formData.location || !formData.phone || !formData.author) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert("Post created successfully!");
        setFormData({
          type: "Blood Needed",
          title: "",
          description: "",
          location: "",
          phone: "",
          author: "",
          urgent: false
        });
        setShowCreateModal(false);
        // Refresh posts from backend
        fetchPosts();
      } else {
        alert("Error: " + (data.message || "Failed to create post"));
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post: " + error.message);
    }
  };

  return (
    <div className="community-container">
      <main className="main-content">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Community Help Board</h1>
            <p className="subtitle">Connect with people in emergencies</p>
          </div>

          <button
            className="create-post-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} /> Create Post
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => handleFilterChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="posts-list">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>No posts found. Be the first to create a help request!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="tag">{post.type}</span>
                  {post.urgent && <span className="tag urgent">Urgent</span>}
                  <span className="time">{post.timeAgo}</span>
                </div>

                <h3>{post.title}</h3>
                <p>{post.description}</p>

                <div className="post-info">
                  <span>
                    <MapPin size={14} /> {post.location}
                  </span>
                  {post.phone && (
                    <span>
                      <Phone size={14} /> {post.phone}
                    </span>
                  )}
                </div>

                <div className="post-footer">
                  <span>{post.author}</span>
                  <button
                    className="respond-btn"
                    onClick={() => openWhatsApp(post.phone, post.title, post.location)}
                  >
                    Respond on WhatsApp
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Emergency Button */}
      <button className="fab" onClick={() => handlePanicButton(navigate)}>
        <AlertTriangle />
      </button>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Help Request</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="create-form">
              <label>Category</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option>Blood Needed</option>
                <option>Missing Person</option>
                <option>Medical Emergency</option>
                <option>Shelter Needed</option>
                <option>Food / Water</option>
                <option>Disaster Help</option>
              </select>

              <label>Title</label>
              <input 
                placeholder="Brief title" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />

              <label>Description</label>
              <textarea 
                placeholder="Describe your situation..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />

              <label>Location</label>
              <input 
                placeholder="Area / Hospital / City" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />

              <label>Contact Phone</label>
              <input 
                placeholder="92xxxxxxxxxx" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />

              <label>Your Name</label>
              <input 
                placeholder="Your name" 
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                required
              />

              <label className="urgent-check">
                <input 
                  type="checkbox" 
                  checked={formData.urgent}
                  onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                />
                <span>Mark as Urgent</span>
              </label>

              <button className="submit-btn" type="button" onClick={handleSubmitPost}>
                Post Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityBoard;
