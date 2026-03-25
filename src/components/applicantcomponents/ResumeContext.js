import React, { createContext, useContext, useState } from 'react';

const ResumeContext = createContext();

const initialState = {
  profileData: {
    resumeSummary: null,
    personalDetails: {},
    educationDetails: [],
    projectDetails: [],
    keySkills: [],
  },
  jobDescription: "",
  templateId: null,
  pdfUrl: null
};

export const ResumeProvider = ({ children }) => {

  //Load from localStorage on first render
  const [resumeState, setResumeState] = useState(() => {
    const saved = localStorage.getItem("resumeState");
    return saved ? JSON.parse(saved) : initialState;
  });

  //Update top-level fields
  const updateResumeState = (key, value) => {
    setResumeState(prev => {
      const updated = { ...prev, [key]: value };

      localStorage.setItem("resumeState", JSON.stringify(updated));

      return updated;
    });
  };

  //Update profileData safely
  const setProfileData = (updater) => {
    setResumeState(prevState => {

      const updatedProfile =
        typeof updater === "function"
          ? updater(prevState.profileData)
          : updater;

      const updatedState = {
        ...prevState,
        profileData: updatedProfile
      };

      localStorage.setItem("resumeState", JSON.stringify(updatedState));

      return updatedState;
    });
  };

  return (
    <ResumeContext.Provider
      value={{
        resumeState,
        updateResumeState,
        setProfileData
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);

