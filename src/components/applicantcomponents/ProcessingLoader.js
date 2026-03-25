import React from "react";
import sandclock from "./sand-clock_14639150.png";

const ProcessingLoader = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6); /* Dimmed background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px); /* Optional: adds a modern feel */
}


.loader-modal {
  background: white;
  padding: 40px 60px;
  border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  border:2px solid #ED8629;
}

.loader-content {
  display: flex;
  align-items: center;
  gap: 25px;
}

.icon-container img {
  width: 60px;
  height: auto;
}

.text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wait-text {
  margin: 0;
  font-size: 16px;
  color: #555;
  font-weight: 500;
}

.processing-text {
  margin: 5px 0 0 0;
  font-size: 18px;
  color: #333;
  font-weight: 700;
}

/* Subtle pulse animation for the icon */
.pulse-animation {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}`}
      </style>
      <div className="loader-overlay">
        <div className="loader-modal">
          <div className="loader-content">
            <div className="icon-container">
              {/* Replace with your actual SVG or Image */}
              <img
                src={sandclock}
                alt="Processing"
                className="pulse-animation"
              />
            </div>
            <div className="text-container">
              <p className="wait-text">Please Wait...</p>
              <h2 className="processing-text">AI Resume is processing</h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcessingLoader;
