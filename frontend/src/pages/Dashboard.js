import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Heart, Car, Droplet, Shield, Zap, AlertTriangle } from 'lucide-react';
import EmergencyModal from './EmergencyModal';
import { handlePanicButton } from '../utils/panicButton';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const emergencyGuides = {
    fire: [
  "Stay calm. Shout 'FIRE' to alert everyone nearby and activate the fire alarm if available.",

  "Call the fire emergency number immediately. Clearly state your location and that there is a fire.",

  "Only if the fire is small and you are trained, use a fire extinguisher: Pull the safety pin, Aim the nozzle at the base of the fire, Squeeze the handle, and Sweep side to side.",

  "If the fire grows, there is heavy smoke, or you feel unsafe, stop firefighting immediately and evacuate.",

  "Evacuate using stairs, stay low under smoke, close doors behind you, and move to the designated assembly area."
]
,
  medical: [
  "Call emergency medical services immediately and put the phone on speaker.",

  "Check if the person is conscious by gently tapping and asking loudly, 'Are you okay?'",

  "If the person is not breathing or unresponsive, follow the dispatcher’s instructions and begin CPR if guided.",

  "If there is bleeding, press firmly with a clean cloth or bandage to stop the bleeding.",

  "Keep the person still, warm, and calm until professional medical help arrives."
]
,
   accident: [
  "Ensure your own safety first by moving away from traffic or dangerous areas.",

  "Call emergency services and clearly describe the accident location and number of injured people.",

  "Turn off vehicle engines if safe and switch on hazard lights to warn others.",

  "Check injured persons without moving them unless there is immediate danger.",

  "Provide first aid only if trained and stay at the scene until help arrives."
]
,
    flood: [
  "Move immediately to higher ground away from rivers, drains, or flooded streets.",

  "Do not walk or drive through floodwater, as even shallow water can be dangerous.",

  "Turn off electricity and gas supplies only if instructed and safe to do so.",

  "Listen to official emergency alerts on radio or phone for evacuation instructions.",

  "Help others only if it does not put you at risk and wait for rescue assistance."
]
,
   security: [
  "Move away from the threat and find a safe, secure location immediately.",

  "Call police or emergency security services as soon as you are safe.",

  "Lock doors, turn off lights, and remain quiet if hiding is necessary.",

  "Do not confront or attempt to stop the attacker.",

  "Follow instructions from authorities until the situation is officially cleared."
]
,
 electrical: [
  "Do not touch exposed wires, equipment, or anything that may be electrified.",

  "If safe, turn off the main power supply from the breaker or switch.",

  "Call emergency services or the electricity provider immediately.",

  "If someone is injured, do not touch them directly until power is off.",

  "Stay away from the hazard area and warn others to keep their distance."
]

  };

  function handleGetHelp(type) {
    setSelectedEmergency(type);
    setModalOpen(true);
  }

  return React.createElement(
    'div',
    { className: 'dashboard' },
    // Main content
    React.createElement(
      'main',
      { className: 'main-content' },
      React.createElement(
        'div',
        { className: 'title-section' },
        React.createElement(
          'p',
          { className: 'subtitle' },
          'Quick access to emergency guides, first aid instructions, and immediate help'
        )
      ),

      // Emergency Grid
      React.createElement(
        'div',
        { className: 'emergency-grid' },
        // Fire
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-fire' }, React.createElement(Flame)),
          React.createElement('h3', { className: 'card-title' }, 'Fire Emergency'),
          React.createElement('p', { className: 'card-description' }, 'Fire outbreak, smoke, or burning hazards'),
          React.createElement('button', { className: 'get-help-button button-red', onClick: function() { handleGetHelp('fire'); } }, 'Get Help')
        ),
        // Medical
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-medical' }, React.createElement(Heart)),
          React.createElement('h3', { className: 'card-title' }, 'Medical Emergency'),
          React.createElement('p', { className: 'card-description' }, 'Heart attack, stroke, or severe injury'),
          React.createElement('button', { className: 'get-help-button button-blue', onClick: function() { handleGetHelp('medical'); } }, 'Get Help')
        ),
        // Accident
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-accident' }, React.createElement(Car)),
          React.createElement('h3', { className: 'card-title' }, 'Accident'),
          React.createElement('p', { className: 'card-description' }, 'Vehicle collision or road accident'),
          React.createElement('button', { className: 'get-help-button button-yellow', onClick: function() { handleGetHelp('accident'); } }, 'Get Help')
        ),
        // Flood
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-water' }, React.createElement(Droplet)),
          React.createElement('h3', { className: 'card-title' }, 'Flood/Water'),
          React.createElement('p', { className: 'card-description' }, 'Flooding, water damage, or drowning'),
          React.createElement('button', { className: 'get-help-button button-blue', onClick: function() { handleGetHelp('flood'); } }, 'Get Help')
        ),
        // Security
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-security' }, React.createElement(Shield)),
          React.createElement('h3', { className: 'card-title' }, 'Security Threat'),
          React.createElement('p', { className: 'card-description' }, 'Theft, violence, or criminal activity'),
          React.createElement('button', { className: 'get-help-button button-red', onClick: function() { handleGetHelp('security'); } }, 'Get Help')
        ),
        // Electrical
        React.createElement(
          'div',
          { className: 'emergency-card' },
          React.createElement('div', { className: 'emergency-icon icon-electrical' }, React.createElement(Zap)),
          React.createElement('h3', { className: 'card-title' }, 'Electrical Hazard'),
          React.createElement('p', { className: 'card-description' }, 'Power outage, electrical fire, or shock'),
          React.createElement('button', { className: 'get-help-button button-yellow', onClick: function() { handleGetHelp('electrical'); } }, 'Get Help')
        )
      )
    ),

    // Emergency Modal
    React.createElement(EmergencyModal, {
      isOpen: modalOpen,
      onClose: function() { setModalOpen(false); },
      title: selectedEmergency ? selectedEmergency.toUpperCase() + ' GUIDE' : '',
      steps: selectedEmergency ? emergencyGuides[selectedEmergency] : []
    }),

    // Floating Emergency Button
    React.createElement(
      'button',
      { 
        className: 'fab',
        onClick: () => handlePanicButton(navigate)
      },
      React.createElement(AlertTriangle)
    )
  );
}

export default Dashboard;
