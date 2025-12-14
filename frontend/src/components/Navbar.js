// Navbar.js
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Bell, Home, Phone, BookOpen, Shield, Map, MessageCircle, Settings, ExternalLink } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ currentUser }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/alerts/latest");
        const data = await res.json();
        if (data.success) {
          setNotifications(data.alerts);
          setUnreadCount(data.alerts.length);
        }
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) setUnreadCount(0);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Shield size={20} />
          <span className="logo-text">RapidResQ</span>
        </div>

        <nav className="navbar-links">
          <NavLink to="/dashboard" className="nav-link"><Home size={18} /> Dashboard</NavLink>
          <NavLink to="/emergency-numbers" className="nav-link"><Phone size={18} /> Emergency</NavLink>
          <NavLink to="/firstaid" className="nav-link"><BookOpen size={18} /> First Aid</NavLink>
          <NavLink to="/community" className="nav-link"><Shield size={18} /> Community</NavLink>
          <NavLink to="/safetymap" className="nav-link"><Map size={18} /> Safety Map</NavLink>
          <NavLink to="/aihelp" className="nav-link"><MessageCircle size={18} /> AI Help</NavLink>
        </nav>

        <div className="navbar-right">
          <div className="nav-notification">
            <div className="bell-icon" onClick={toggleDropdown}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.length === 0 ? (
                  <div className="notification-item">No notifications</div>
                ) : (
                  notifications.map((note, idx) => (
                    <div key={idx} className="notification-item">
                      <strong>{note.author}</strong> triggered a panic alert.<br />
                      <small>Location: {note.location}</small><br />
                      <NavLink to={`/community/post/${note._id}`} className="notification-link">
                        View Post <ExternalLink size={14} />
                      </NavLink>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <NavLink to="/account" className="nav-link"><Settings size={20} /></NavLink>
        </div>
      </div>
    </header>
  );
}
