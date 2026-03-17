import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../common/UserProvider";
import "./ApplicantMyStreaks.css";
import { apiUrl } from "../../services/ApplicantAPIService";

const ApplicantMyStreaks = () => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const [streakDetails, setStreakDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    // Attempted dates from new API – stored as a Set of "YYYY-MM-DD" strings
    const [attemptedDates, setAttemptedDates] = useState(new Set());
    // Answer Reveals State
    const todayStr = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [revealedAnswers, setRevealedAnswers] = useState(null);
    const [answersLoading, setAnswersLoading] = useState(false);

    useEffect(() => {
        const fetchStreakDetails = async () => {
            try {
                setLoading(true);
                const jwtToken = localStorage.getItem("jwtToken");
                if (!user?.id) return;
                const response = await axios.get(
                    `${apiUrl}/streak/${user.id}/getStreakDetails`,
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

    // Fetch attempted dates from the new API
    useEffect(() => {
        const fetchAttemptedDates = async () => {
            if (!user?.id) return;
            try {
                const jwtToken = localStorage.getItem("jwtToken");
                const response = await axios.get(
                    `${apiUrl}/streak/${user.id}/getAttemptedDates`,
                    { headers: { Authorization: `Bearer ${jwtToken}` } }
                );
                // Response is an array of [year, month, day] arrays
                if (Array.isArray(response.data)) {
                    const dateSet = new Set(
                        response.data.map(([year, month, day]) => {
                            const m = String(month).padStart(2, "0");
                            const d = String(day).padStart(2, "0");
                            return `${year}-${m}-${d}`;
                        })
                    );
                    setAttemptedDates(dateSet);
                }
            } catch (err) {
                // 404 means the applicant hasn't started any streak yet – show empty calendar
                if (err?.response?.status === 404) {
                    setAttemptedDates(new Set());
                } else {
                    console.error("Failed to fetch attempted dates:", err);
                }
            }
        };
        fetchAttemptedDates();
    }, [user?.id]);

    const goBack = () => {
        navigate("/applicanthome");
    };
    useEffect(() => {
        if (user?.id) {
            fetchAnswersForDate(todayStr);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const fetchAnswersForDate = async (dateStr) => {
        if (!dateStr || !user?.id) return;
        try {
            setAnswersLoading(true);
            const jwtToken = localStorage.getItem("jwtToken");
            // Assuming API supports filtering by date or we get all and filter locally for now.
            // Using the full fetch as an example, update API path if date query is supported.
            const response = await axios.get(
                `${apiUrl}/streak/${user.id}/questions/attempted`,
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                }
            );

            // Filter locally to be safe if the endpoint returns all history
            if (response.data && Array.isArray(response.data)) {
                const filtered = response.data.filter(q => {
                    // Our mock was looking for attemptDate string, but the API sends a 'date' array
                    if (!q.date || !Array.isArray(q.date)) {
                        // fallback check for attemptDate just in case
                        if (q.attemptDate && typeof q.attemptDate === 'string') {
                            return q.attemptDate.startsWith(dateStr);
                        }
                        return false;
                    }
                    const [year, month, day] = q.date;
                    const formattedMonth = String(month).padStart(2, '0');
                    const formattedDay = String(day).padStart(2, '0');
                    const apiDateStr = `${year}-${formattedMonth}-${formattedDay}`;
                    return apiDateStr === dateStr;
                });
                setRevealedAnswers(filtered.length > 0 ? filtered : null);
                // If API response is flat (not an array but a single object of questions wrapper), 
                // we'd adjust here. Assuming array for now based on typical list endpoint.
            } else {
                setRevealedAnswers(response.data || null);
            }

        } catch (err) {
            console.error("Failed to fetch answers for date:", err);
            setRevealedAnswers(null);
        } finally {
            setAnswersLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const dateStr = e.target.value;
        setSelectedDate(dateStr);
        if (dateStr) {
            fetchAnswersForDate(dateStr);
        } else {
            setRevealedAnswers(null);
        }
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

    // Earliest attempted date – lower bound for un-submission colouring
    const firstAttemptedDate = attemptedDates.size > 0
        ? new Date(
            Math.min(
                ...[...attemptedDates].map((s) => new Date(s).getTime())
            )
        )
        : null;

    const getDayStatus = (date) => {
        if (date > today) return "upcoming";

        // Check if this date was actually attempted (from API)
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateKey = `${yyyy}-${mm}-${dd}`;

        if (attemptedDates.has(dateKey)) return "submission";

        // Today but not attempted yet
        if (date.getTime() === today.getTime()) return "yet-to-submission";

        // Between first attempted date and today → un-submission (red gap)
        if (firstAttemptedDate && date >= firstAttemptedDate) return "un-submission";

        // Before the streak ever started → no activity
        return "default";
    };
    if (loading) {
        return (
            <div className="border-style">
                <div className="dashboard__content my-streaks-page">
                    <div className="mystreaks-skeleton-container">
                        <div className="skeleton-rect header"></div>
                        <div className="skeleton-rect card"></div>
                        <div className="skeleton-rect section-title"></div>
                        <div className="skeleton-rect small-card"></div>
                        <div className="skeleton-rect small-card"></div>
                    </div>
                </div>
            </div>
        );
    }
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
                {/* Answer Reveals UI Section */}
                <div className="answer-reveals-section">
                    <div className="answer-reveals-header">
                        <div className="answer-reveals-title-area">
                            <h3 className="answer-reveals-title">Answer Reveals</h3>
                            {revealedAnswers && revealedAnswers.length > 0 && (
                                <span className="answer-reveals-badge">Submitted</span>
                            )}
                        </div>
                        <div className="answer-reveals-date-picker">
                            <input
                                type="date"
                                className="date-picker-input"
                                value={selectedDate}
                                onChange={handleDateChange}
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                    </div>

                    <div className="answer-reveals-content">
                        {answersLoading ? (
                            <div className="answer-loading-container">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="answer-skeleton-block">
                                        <div className="skeleton-line title"></div>
                                        <div className="skeleton-line option"></div>
                                        <div className="skeleton-line option"></div>
                                        <div className="skeleton-box explanation"></div>
                                    </div>
                                ))}
                            </div>
                        ) : revealedAnswers && revealedAnswers.length > 0 ? (
                            <div className="revealed-questions-list">
                                {revealedAnswers.map((item, index) => (
                                    <div key={index} className="revealed-question-block">
                                        <h4 className="r-question-text">{index + 1}. {item.questionText || item.question}</h4>

                                        <div className="r-options-container">
                                            {item.options && Object.entries(item.options).some(([key, val]) => item.correctAnswer === key || item.correctAnswer === val) ? (
                                                Object.entries(item.options).map(([key, val]) => {
                                                    const isCorrectAnswer = item.correctAnswer === key || item.correctAnswer === val;

                                                    if (!isCorrectAnswer) return null; // Only show the correct answer

                                                    return (
                                                        <div key={key} className="r-option correct">
                                                            <span className="r-option-letter">{key}</span>
                                                            <span className="r-option-val">{val}</span>
                                                            <span className="r-icon">✓</span>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="r-option correct">
                                                    <span className="r-option-letter">Ans</span>
                                                    <span className="r-option-val">{item.correctAnswer}</span>
                                                    <span className="r-icon">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        {(item.explanation || item.description) && (
                                            <div className="r-explanation-box">
                                                <strong>Explanation: </strong> {item.explanation || item.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="revealed-questions-list">
                                <div className="revealed-question-block" style={{ textAlign: "center", padding: "40px 20px" }}>
                                    <h4 className="r-question-text" style={{ margin: 0, color: "#666" }}>
                                        No Question attempted on this day, select another date.
                                    </h4>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ApplicantMyStreaks;
