import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../common/UserProvider";
import "./ApplicantMyStreaks.css";

const ApplicantMyStreaks = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [streakDetails, setStreakDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreakDetails = async () => {
            try {
                setLoading(true);
                const jwtToken = localStorage.getItem("jwtToken");
                if (!user?.id) return;
                const response = await axios.get(
                    `http://localhost:8081/streak/${user.id}/getStreakDetails`,
                    {
                        headers: { Authorization: `Bearer ${jwtToken}` },
                    }
                );
                setStreakDetails(response.data);
            } catch (err) {
                console.error("Failed to fetch streak details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStreakDetails();
    }, [user?.id]);

    const goBack = () => {
        navigate("/applicanthome");
    };

    const currentYear = new Date().getFullYear();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    const headerDays = [];
    for (let i = 0; i < 37; i++) {
        headerDays.push(dayLabels[i % 7]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStreak = streakDetails?.currentStreak || 0;

    // Calculate dynamic display year (e.g. 2025/2026 or just 2026)
    const streakStart = new Date(today);
    if (currentStreak > 0) {
        streakStart.setDate(today.getDate() - currentStreak + 1);
    }
    const startYear = streakStart.getFullYear();
    const displayYear = startYear < currentYear ? `${startYear}/${currentYear}` : currentYear;

    const getDayStatus = (date) => {
        if (date > today) return "upcoming";

        // Within current streak
        const streakStart = new Date(today);
        streakStart.setDate(today.getDate() - currentStreak + 1);

        // Adjust logic to correctly mark "taken" vs "missed" vs current day "to-submission"
        if (date >= streakStart && date <= today && currentStreak > 0) {
            return "submission";
        }

        // Let's just mock past 5 days missing prior to streak
        const missLimit = new Date(streakStart);
        missLimit.setDate(streakStart.getDate() - 5);

        if (date >= missLimit && date < streakStart) {
            return "un-submission";
        }

        if (date.getTime() === today.getTime() && currentStreak === 0) {
            return "yet-to-submission";
        }

        // Default 
        return "default";
    };

    return (
        <div className="border-style">
            <div className="dashboard__content my-streaks-page">
                <div className="my-streaks-header" onClick={goBack}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="18"
                        viewBox="0 0 12 18"
                        fill="none"
                    >
                        <path
                            d="M10 1L2 9L10 17"
                            stroke="#EA7B20"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="my-streaks-title-text">My Streaks</span>
                </div>

                <div className="my-streaks-card-area">
                    <div className="submission-streak-header">
                        <h3 className="submission-streak-title">Submission Streak {displayYear}</h3>
                    </div>

                    <div className="calendar-legend-container" style={{ justifyContent: 'flex-start', marginTop: '0', marginBottom: '20px' }}>
                        <div className="calendar-legend">
                            <div className="legend-item">
                                <span className="legend-text">Submission</span>
                                <div className="legend-box green"></div>
                            </div>
                            <div className="legend-item">
                                <span className="legend-text">Un-submission</span>
                                <div className="legend-box red"></div>
                            </div>
                            <div className="legend-item">
                                <span className="legend-text">Yet to-submission</span>
                                <div className="legend-box orange"></div>
                            </div>
                        </div>
                    </div>

                    <div className="calendar-scroll-wrapper">
                        <div className="calendar-container">
                            <div className="calendar-header-row">
                                <div className="calendar-month-spacer"></div>
                                {headerDays.map((d, i) => (
                                    <div key={i} className="calendar-header-day" style={{ color: d === 'S' ? '#EA7B20' : '#888' }}>{d}</div>
                                ))}
                            </div>

                            <div className="calendar-body">
                                {months.map((monthName, mIndex) => {
                                    const daysInMonth = new Date(currentYear, mIndex + 1, 0).getDate();
                                    const startOffset = new Date(currentYear, mIndex, 1).getDay();

                                    const rowCells = [];
                                    for (let col = 0; col < 37; col++) {
                                        if (col < startOffset || col >= startOffset + daysInMonth) {
                                            rowCells.push(<div key={col} className="calendar-cell empty"></div>);
                                        } else {
                                            const dayNum = col - startOffset + 1;
                                            const currentCellDate = new Date(currentYear, mIndex, dayNum);

                                            const status = getDayStatus(currentCellDate);
                                            let cellClass = "calendar-cell filled grey";
                                            let titleText = "No Activity";

                                            if (status === "submission") { cellClass = "calendar-cell filled green"; titleText = "Submission"; }
                                            if (status === "un-submission") { cellClass = "calendar-cell filled red"; titleText = "Un-submission"; }
                                            if (status === "yet-to-submission") { cellClass = "calendar-cell filled orange"; titleText = "Yet to-submission"; }
                                            if (status === "upcoming") { cellClass = "calendar-cell filled grey"; titleText = "Upcoming"; }

                                            rowCells.push(<div key={col} className={cellClass} title={titleText}></div>);
                                        }
                                    }

                                    return (
                                        <div key={monthName} className="calendar-month-row">
                                            <div className="calendar-month-label">{monthName}</div>
                                            {rowCells}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ApplicantMyStreaks;
