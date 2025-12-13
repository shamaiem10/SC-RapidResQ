import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Phone,
  BookOpen,
  Shield,
  Map,
  MessageCircle,
 
  Settings   // 👈 ADD THIS
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  return React.createElement(
    "header",
    { className: "navbar" },
    React.createElement(
      "div",
      { className: "navbar-container" },

      /* Logo */
      React.createElement(
        "div",
        { className: "navbar-logo" },
        React.createElement(
          "div",
          { className: "logo-icon" },
          React.createElement(Shield, { size: 20 })
        ),
        React.createElement(
          "span",
          { className: "logo-text" },
          "RapidResQ"
        )
      ),

      /* Navigation */
      React.createElement(
        "nav",
        { className: "navbar-links" },

        React.createElement(
          NavLink,
          { to: "/dashboard", className: "nav-link" },
          React.createElement(Home, { size: 18 }),
          "Dashboard"
        ),

        React.createElement(
          NavLink,
          { to: "/emergency-numbers", className: "nav-link" },
          React.createElement(Phone, { size: 18 }),
          "Emergency"
        ),

        React.createElement(
          NavLink,
          { to: "/firstaid", className: "nav-link" },
          React.createElement(BookOpen, { size: 18 }),
          "First Aid"
        ),

        React.createElement(
          NavLink,
          { to: "/community", className: "nav-link" },
          React.createElement(Shield, { size: 18 }),
          "Community"
        ),

        React.createElement(
          NavLink,
          { to: "/safetymap", className: "nav-link" },
          React.createElement(Map, { size: 18 }),
          "Safety Map"
        ),

        React.createElement(
          NavLink,
          { to: "/aihelp", className: "nav-link" },
          React.createElement(MessageCircle, { size: 18 }),
          "AI Help"
        ),

        /* Settings */
        React.createElement(
          NavLink,
          { to: "/account", className: "nav-link" },
          React.createElement(Settings, { size: 18 }),
          "Settings"
        )
      ),

      
    )
  );
}
