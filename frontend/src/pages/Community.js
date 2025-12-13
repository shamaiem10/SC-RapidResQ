import React, { useState } from "react";
import {
 
  Plus,
  Phone,
  MapPin,
  AlertTriangle
} from "lucide-react";
import "./Community.css";

function CommunityBoard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filters = [
    { id: "All", label: "All" },
    { id: "Blood", label: "Blood Needed" },
    { id: "Missing", label: "Missing Person" },
    { id: "Medical", label: "Medical Emergency" },
    { id: "Shelter", label: "Shelter Needed" },
    { id: "Food", label: "Food / Water" },
    { id: "Disaster", label: "Disaster Help" },
    { id: "Urgent", label: "Urgent Only" }
  ];

  const posts = [
    {
      id: 1,
      type: "Blood Needed",
      urgent: true,
      title: "Urgent: O+ Blood Needed",
      description: "O+ blood required at City Hospital immediately.",
      location: "City Hospital",
      phone: "923336343230", // digits only
      author: "Community Member",
      responses: 3,
      timeAgo: "32m ago"
    },
    {
      id: 2,
      type: "Missing Person",
      urgent: true,
      title: "Missing Child – 8 Years Old",
      description: "Last seen near Central Park.",
      location: "Central Park",
      phone: "923009876543",
      author: "Local Police",
      responses: 12,
      timeAgo: "7h ago"
    }
  ];

  // Open WhatsApp chat immediately
  const openWhatsApp = (phone) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, "");
    const url = `https://wa.me/${cleanNumber}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="posts-list">
          {posts
            .filter(post => activeFilter === "All" || post.type.includes(activeFilter))
            .map((post) => (
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
                    onClick={() => openWhatsApp(post.phone)}
                  >
                    Respond on WhatsApp
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Floating Emergency Button */}
      <button className="fab">
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
              <select>
                <option>Blood Needed</option>
                <option>Missing Person</option>
                <option>Medical Emergency</option>
                <option>Shelter Needed</option>
                <option>Food / Water</option>
                <option>Disaster Help</option>
              </select>

              <label>Title</label>
              <input placeholder="Brief title" />

              <label>Description</label>
              <textarea placeholder="Describe your situation..." />

              <label>Location</label>
              <input placeholder="Area / Hospital / City" />

              <label>Contact Phone</label>
              <input placeholder="+92..." />

              <label className="urgent-check">
                <input type="checkbox" />
                <span>Mark as Urgent</span>
              </label>

              <button className="submit-btn" type="button">
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
