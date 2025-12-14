import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FirstAidLibrary.css';
import EmergencyModal from './EmergencyModal';
import { BookOpen, Heart, Clock,AlertCircle, Droplet, Scissors, Activity, AlertTriangle } from 'lucide-react';
import { handlePanicButton } from '../utils/panicButton';

// Step-by-step guides for each topic
const guides = {
  cpr: [
    "Check responsiveness and breathing",
    "Call emergency services",
    "Start chest compressions",
    "Give rescue breaths",
    "Continue until help arrives"
  ],
  choking: [
    "Ask if they can speak or cough",
    "Perform Heimlich maneuver",
    "Repeat until object expelled",
    "Call emergency services if needed"
  ],
  bleeding: [
    "Apply direct pressure",
    "Elevate the wound if possible",
    "Use bandage to maintain pressure",
    "Seek professional help if bleeding continues",
    "Monitor for shock symptoms"
  ],
  burn: [
    "Cool burn under running water for 10-20 min",
    "Remove tight items from area",
    "Cover burn with sterile dressing",
    "Avoid applying creams or ice",
    "Seek medical help for severe burns"
  ],
  wound: [
    "Wash hands and clean wound with clean water",
    "Apply antiseptic if available",
    "Cover with sterile dressing or bandage",
    "Change dressing regularly",
    "Watch for signs of infection"
  ],
  shock: [
    "Lay person down and elevate legs",
    "Keep person warm",
    "Do not give food or drink",
    "Monitor breathing and consciousness",
    "Call emergency services immediately"
  ]
};

const FirstAidLibrary = () => {
  const navigate = useNavigate();
  const [selectedGuide, setSelectedGuide] = useState(null);

  const openGuide = (key) => setSelectedGuide(key);
  const closeGuide = () => setSelectedGuide(null);

  return (
    <div className="first-aid-library-page">
      <main className="main-content">
        <div className="title-section">
          <h1 className="page-title">First Aid Library</h1>
          <p className="page-subtitle">
            Step-by-step first aid guides with visual instructions and audio guidance
          </p>
        </div>

        {/* Critical Life-Saving Skills */}
        <section className="critical-section">
          <div className="section-header">
            <AlertCircle className="section-icon" />
            <h2 className="section-title">Critical Life-Saving Skills</h2>
          </div>

          <div className="critical-grid">
            <div className="critical-card" onClick={() => openGuide('cpr')}>
              <div className="critical-card-header">
                <div className="critical-card-info">
                  <div className="critical-icon-container icon-red"><Heart /></div>
                  <div>
                    <h3 className="critical-card-title">CPR (Cardiopulmonary Resuscitation)</h3>
                    <p className="critical-card-description">Life-saving technique for cardiac arrest</p>
                  </div>
                </div>
                <span className="critical-badge">Critical</span>
              </div>
              <div className="critical-card-meta">
                <div className="meta-item"><Clock /><span>5-10 min</span></div>
                <div className="meta-item"><BookOpen /><span>5 steps</span></div>
              </div>
            </div>

            <div className="critical-card" onClick={() => openGuide('choking')}>
              <div className="critical-card-header">
                <div className="critical-card-info">
                  <div className="critical-icon-container icon-red-alert"><AlertCircle /></div>
                  <div>
                    <h3 className="critical-card-title">Choking Relief</h3>
                    <p className="critical-card-description">Heimlich maneuver for blocked airways</p>
                  </div>
                </div>
                <span className="critical-badge">Critical</span>
              </div>
              <div className="critical-card-meta">
                <div className="meta-item"><Clock /><span>2-3 min</span></div>
                <div className="meta-item"><BookOpen /><span>4 steps</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* All First Aid Topics */}
        <section className="topics-section">
          <h2 className="section-title">All First Aid Topics</h2>
          <div className="topics-grid">
            <div className="topic-card" onClick={() => openGuide('cpr')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-red"><Heart /></div>
                <div className="topic-info">
                  <h3 className="topic-title">CPR</h3>
                  <p className="topic-description">Life-saving technique for cardiac arrest</p>
                  <span className="topic-badge badge-critical">Critical</span>
                </div>
              </div>
              <span className="topic-duration">5-10 min</span>
            </div>

            <div className="topic-card" onClick={() => openGuide('choking')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-red-alert"><AlertCircle /></div>
                <div className="topic-info">
                  <h3 className="topic-title">Choking Relief</h3>
                  <p className="topic-description">Heimlich maneuver for blocked airways</p>
                  <span className="topic-badge badge-critical">Critical</span>
                </div>
              </div>
              <span className="topic-duration">2-3 min</span>
            </div>

            <div className="topic-card" onClick={() => openGuide('bleeding')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-blue"><Droplet /></div>
                <div className="topic-info">
                  <h3 className="topic-title">Severe Bleeding Control</h3>
                  <p className="topic-description">How to stop heavy bleeding and apply pressure</p>
                  <span className="topic-badge badge-important">Important</span>
                </div>
              </div>
              <span className="topic-duration">3-5 min</span>
            </div>

            <div className="topic-card" onClick={() => openGuide('burn')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-blue-burn"><Activity /></div>
                <div className="topic-info">
                  <h3 className="topic-title">Burn Treatment</h3>
                  <p className="topic-description">First aid for burns and scalds</p>
                  <span className="topic-badge badge-important">Important</span>
                </div>
              </div>
              <span className="topic-duration">5-8 min</span>
            </div>

            <div className="topic-card" onClick={() => openGuide('wound')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-green"><Scissors /></div>
                <div className="topic-info">
                  <h3 className="topic-title">Wound Cleaning & Dressing</h3>
                  <p className="topic-description">Clean and dress minor cuts and wounds</p>
                  <span className="topic-badge badge-basic">Basic</span>
                </div>
              </div>
              <span className="topic-duration">3-5 min</span>
            </div>

            <div className="topic-card" onClick={() => openGuide('shock')}>
              <div className="topic-card-header">
                <div className="topic-icon-wrapper icon-blue-shock"><Activity /></div>
                <div className="topic-info">
                  <h3 className="topic-title">Shock Management</h3>
                  <p className="topic-description">Recognizing and treating shock symptoms</p>
                  <span className="topic-badge badge-important">Important</span>
                </div>
              </div>
              <span className="topic-duration">4-6 min</span>
            </div>
          </div>
        </section>
      </main>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={!!selectedGuide}
        onClose={closeGuide}
        title={selectedGuide ? selectedGuide.toUpperCase() : ""}
        steps={selectedGuide ? guides[selectedGuide] : []}
      />

      <button className="emergency-float-button" onClick={() => handlePanicButton(navigate)}>
        <AlertTriangle />
      </button>
    </div>
  );
};

export default FirstAidLibrary;
