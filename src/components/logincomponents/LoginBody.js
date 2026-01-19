import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../common/UserProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { apiUrl } from "../../services/ApplicantAPIService";
import { useGoogleLogin } from "@react-oauth/google";
import OTPVerification from "../applicantcomponents/OTPVerification";
import Background from "../../images/user/avatar/Backgroundimage.png";
import logo from '../../images/icons/newLogo.png';

import Backgroundimagemobile from "../../images/user/avatar/backgroundimage-mobile.png";
import Snackbar from "../common/Snackbar";
import CryptoJS from "crypto-js";
import ZohoCRMService from "../zohoCrmComponent/zohoCrm";
import { saveFcmTokenWeb } from "../../notifications/notificationWeb";
import { generateToken } from "../../notifications/firebase";


function LoginBody({ handleLogin }) {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const registrationSuccess = location.state?.registrationSuccess;
  const navigate = useNavigate();
  const { setUser, setUserType } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("Candidate");
  const [candidateEmailError, setCandidateEmailError] = useState("");
  const [candidatePasswordError, setCandidatePasswordError] = useState("");
  const [registrationSuccessMessage, setRegistrationSuccessMessage] =
    useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [message, setMessage] = useState("Welcome Back");
  const { user } = useUserContext();
  // State variables for UTM parameters
  const [utmSource, setUtmSource] = useState("bitlabs.in");
  const [utmMedium, setUtmMedium] = useState("bitlabs.in");
  const [utmCampaign, setUtmCampaign] = useState("bitlabs.in");
  const [utmContent, setUtmContent] = useState("bitlabs.in");
  const [utmTerm, setUtmTerm] = useState("bitlabs.in");
  const { handleLead } = ZohoCRMService();



  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Update state variables with UTM parameters from URL if available
    setUtmSource(params.get("utm_source") || "bitlabs.in/jobs");
    setUtmMedium(params.get("utm_medium") || "bitlabs.in/jobs");
    setUtmCampaign(params.get("utm_campaign") || "bitlabs.in/jobs");
    setUtmContent(params.get("utm_content") || "bitlabs.in/jobs");
    setUtmTerm(params.get("utm_term") || "bitlabs.in/jobs");
  }, [location, navigate]);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log("First API");
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );
        console.log(res);
        const email1 = res.data.email;
        const name1 = res.data.name;

        console.log("Second API");
        let loginEndpoint = `${apiUrl}/applicant/applicantLogin`;

        const response1 = await axios.post(
          loginEndpoint,
          {
            email: email1,
            utmSource: utmSource,
          },
          {
            headers: {
              // Ensure no Authorization header is sent
              Authorization: "",
            },
          }
        );

        console.log(response1);
        if (response1.status === 200) {
          setErrorMessage("");
          const userData = response1.data;
          console.log("This is response: ", userData);
          console.log("This is token: ", userData.data.jwt);
          localStorage.setItem("jwtToken", userData.data.jwt);
          const generatedToken = await generateToken()
          try {
            console.log("generated token", generatedToken)
            await saveFcmTokenWeb(userData.id, userData.data.jwt, generatedToken);
          } catch (error) {
            console.error("⚠️ Failed to save FCM token for web:", error);
          }

          // Log the user's activity
          const activityLogEndpoint = `${apiUrl}/api/activity/log`;
          const activityPayload = {
            userId: userData.id,
            actionType: "Login",
          };

          await axios.post(activityLogEndpoint, activityPayload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          });
          console.log("Activity log submitted successfully.");

          setCandidateEmail(email1);
          setCandidateName(name1);

          const leadData = {
            data: [
              {
                Last_Name: name1,
                Email: email1,
                // Lead_Status: "signedup",
                Status_TS: "Signed-Up",
                // Lead_Source: utmSource || "Direct", // Set a default if empty
                Industry: "Software",
                Utm_Source_TS: utmSource || "",
                Utm_Medium_TS: utmMedium || "",
                Utm_Campaign_TS: utmCampaign || "",
                Utm_Content_TS: utmContent || "",
                Utm_Term_TS: utmTerm || "",
              },
            ],
          };

          const id = await handleLead(leadData);
          console.log("Zoho User ID from login page :", id);
          sessionStorage.setItem("zohoUserId", id);



          // const webhookUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzZTA0MzQ1MjZlNTUzNjUxMzci_pc';
          // const webhookData = {
          //   email,
          //   name,
          //   utmSource,
          //   utmMedium,
          //   utmCampaign,
          //   utmContent,
          //   utmTerm,
          // };

          // try {
          //   const webhookResponse = await fetch(webhookUrl, {
          //     method: 'POST',
          //     headers: {
          //       'Content-Type': 'application/json',
          //     },
          //     body: JSON.stringify(webhookData),
          //   });
          //   console.log('Webhook executed');
          // } catch (error) {
          //   console.error('Error sending first webhook:', error);
          // }

          let userType1;
          if (userData.message.includes("ROLE_JOBAPPLICANT")) {
            userType1 = "jobseeker";
          } else if (userData.message.includes("ROLE_JOBRECRUITER")) {
            userType1 = "employer";
          } else {
            userType1 = "unknown";
          }
          console.log("This userType: ", userType1);
          localStorage.setItem("userType", userType1);

          setErrorMessage("");
          handleLogin();

          setUser(userData);
          setUserType(userType1);
          console.log("Login successful", userData);
          const userId = userData.id;

          let jwtToken = localStorage.getItem("jwtToken");
          if (!jwtToken) {
            jwtToken = userData.data.jwt;
          }
          const profileIdResponse = await axios.get(
            `${apiUrl}/applicantprofile/${userId}/profileid`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
          const profileId = profileIdResponse.data;

          let resume;
          try {
            const jwtToken = localStorage.getItem("jwtToken");
            const profileIdResponse1 = await axios.get(

              `${apiUrl}/applicant-pdf/getresume/${userId}`,

              {
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                },
              },

            );
          } catch (error) {
            resume = error.response.status;
          }

          if (profileId !== 0 && resume === 404) {
            console.log("checking ", jwtToken);
            localStorage.setItem("jwtToken", userData.data.jwt);
            navigate("/applicanthome");
            // navigate("/applicant-basic-details-form/3");
          } else if (profileId === 0) {
            console.log("checking ", jwtToken);
            localStorage.setItem("jwtToken", userData.data.jwt);
            navigate("/applicant-basic-details-form/1");
          } else {
            localStorage.setItem("jwtToken", userData.data.jwt);
            navigate("/applicanthome");
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  });
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrorMessage("");
  };
  let userType1;

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!isCandidateFormValid()) {
      return;
    }

    const secretKey = "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p";
    const iv = CryptoJS.lib.WordArray.random(16); // Generate a random IV (16 bytes for AES)
    const encryptedPassword = CryptoJS.AES.encrypt(
      candidatePassword,
      CryptoJS.enc.Utf8.parse(secretKey),
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString();

    try {
      let loginEndpoint = `${apiUrl}/applicant/applicantLogin`;
      const response = await axios.post(
        loginEndpoint,
        {
          email: candidateEmail,
          password: encryptedPassword,
          iv: iv.toString(CryptoJS.enc.Base64),
        },
        {
          headers: {
            // Ensure no Authorization header is sent
            Authorization: "",
          },
        }
      );

      if (response.status === 200) {
        setErrorMessage("");
        const userData = response.data;
        console.log("this is response ", userData);
        console.log("this is token ", userData.data.jwt);
        localStorage.setItem("jwtToken", userData.data.jwt);


        let userType1;
        if (userData.message.includes("ROLE_JOBAPPLICANT")) {
          userType1 = "jobseeker";
          const generatedToken = await generateToken();
          try {
            console.log("generated token", generatedToken);
            await saveFcmTokenWeb(userData.id, userData.data.jwt, generatedToken);
          } catch (error) {
            console.error("⚠️ Failed to save FCM token for web:", error);
          }
        } else if (userData.message.includes("ROLE_JOBRECRUITER")) {
          userType1 = "employer";
        } else {
          userType1 = "unknown";
        }
        console.log("this userType ", userType1);
        localStorage.setItem("userType", userType1);

        setErrorMessage("");
        handleLogin();

        setUser(userData);
        setUserType(userData.userType);
        console.log("Login successful", userData);
        const userId = userData.id;

        // Log the user activity
        const activityLogEndpoint = `${apiUrl}/api/activity/log`;
        await axios.post(
          activityLogEndpoint,
          {
            userId: userId,
            actionType: "Login",
          },
          {
            headers: {
              Authorization: `Bearer ${userData.data.jwt}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Check the profile ID
        let jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
          jwtToken = userData.data.jwt;
        }

        // ✅ Fetch Zoho User ID based on email
        const zohoResponse = await axios.get(
          `${apiUrl}/zoho/searchlead/${candidateEmail}`
        );
        const zohoUserId = zohoResponse.data?.data?.[0]?.id;

        if (zohoUserId) {
          sessionStorage.setItem("zohoUserId", zohoUserId); // Store Zoho User ID in session
          console.log("Zoho User ID:", zohoUserId);
        }

        const profileIdResponse = await axios.get(
          `${apiUrl}/applicantprofile/${userId}/profileid`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );
        const profileId = profileIdResponse.data;
        let resume;
        try {
          const jwtToken = localStorage.getItem("jwtToken")
          const profileIdResponse1 = await axios.get(
            `${apiUrl}/resume/pdf/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }

          );
        } catch (error) {
          resume = error.response.status;
        }
        if (profileId !== 0 && resume === 404) {
          console.log("checking ", jwtToken);
          localStorage.setItem("jwtToken", userData.data.jwt);
          navigate("/applicanthome");
          // navigate("/applicant-basic-details-form/3");
        } else if (profileId === 0) {
          console.log("checking ", jwtToken);
          localStorage.setItem("jwtToken", userData.data.jwt);
          navigate("/applicant-basic-details-form/1");
        } else {
          localStorage.setItem("jwtToken", userData.data.jwt);
          navigate("/applicanthome");
        }
      }
    } catch (error) {
      console.log(error.response.data);
      if (error.response.data === "Incorrect password") {
        setErrorMessage("Incorrect password.");
        console.error("login failed");
      } else if (
        error.response.data === "No account found with this email address"
      ) {
        setErrorMessage("No account found with this email address.");
        console.error("login failed");
      } else {
        setErrorMessage(
          "login failed. Please check your user name and password."
        );
      }
      console.error("Login failed", error);
    }
  };

  const isCandidateFormValid = () => {
    const emailError = validateEmail(candidateEmail);
    setCandidateEmailError(emailError);
    const passwordError = validatePassword(candidatePassword);
    setCandidatePasswordError(passwordError);
    if (!candidateEmail.trim()) {
      setCandidateEmailError("Email is required.");
    }
    if (!candidatePassword.trim()) {
      setCandidatePasswordError("Password is required.");
    }
    if (emailError || passwordError) {
      return false;
    }
    return true;
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? "" : "Please enter a valid email address.";
  };
  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required.";
    }

    return "";
  };

  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail1, setCandidateEmail1] = useState("");
  const [candidateMobileNumber, setCandidateMobileNumber] = useState("");
  const [candidatePassword1, setCandidatePassword1] = useState("");
  const [allErrors, setAllErrors] = useState(false);
  const [candidateNameError, setCandidateNameError] = useState("");
  const [candidateEmailError1, setCandidateEmailError1] = useState("");
  const [candidateMobileNumberError, setCandidateMobileNumberError] =
    useState("");
  const [candidatePasswordError1, setCandidatePasswordError1] = useState("");
  const [candidateOTPSent, setCandidateOTPSent] = useState(false);
  const [candidateOTPVerified, setCandidateOTPVerified] = useState(false);
  const [candidateOTPVerifyingInProgress, setCandidateOTPVerifyingInProgress] =
    useState(false);
  const [candidateOTPSendingInProgress, setCandidateOTPSendingInProgress] =
    useState(false);
  const [candidateRegistrationSuccess, setCandidateRegistrationSuccess] =
    useState(false);
  const [candidateRegistrationInProgress, setCandidateRegistrationInProgress] =
    useState(false);
  const [allFieldsDisabled, setAllFieldsDisabled] = useState(false);
  const [resendOtpMessage, setResendOtpMessage] = useState("");

  const handleSendOTP = async () => {
    if (!isFormValid1()) {
      setAllErrors(true);
      return;
    }
    try {
      setCandidateOTPSendingInProgress(true);
      console.log("email is:", candidateEmail1);
      const response = await axios.post(
        `${apiUrl}/applicant/applicantsendotp`,
        { email: candidateEmail1, mobilenumber: candidateMobileNumber }
      );
      console.log("email is:", candidateEmail1);
      setCandidateOTPSent(true);
      setCandidateOTPSendingInProgress(false);

      if (response.data === "Email is already registered as a Recruiter.") {
        setCandidateOTPSent(false);

        setSnackbar({
          open: true,
          message: "Email already registered as recruiter,please try to login",
          type: "error",
        });
      }

      if (response.data === "Email is already registered as an Applicant.") {
        setCandidateOTPSent(false);

        setSnackbar({
          open: true,
          message: "Email already exists,Please provide a new email ID",
          type: "error",
        });
      }

      if (
        response.data === "Mobile number is already registered as a Recruiter."
      ) {
        setCandidateOTPSent(false);

        setSnackbar({
          open: true,
          message: "Mobile number already existed as recruiter",
          type: "error",
        });
      }

      if (
        response.data === "Mobile number is already registered as an Applicant."
      ) {
        setCandidateOTPSent(false);

        setSnackbar({
          open: true,
          message: "Mobile number already existed as candidate",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error.response.data);
      if (error.response && error.response.status === 400) {
        if (
          error.response.data === "Email is already registered as a Recruiter."
        ) {
          setSnackbar({
            open: true,
            message:
              "Email already registered as recruiter, please try to login",
            type: "error",
          });
        } else if (
          error.response.data === "Email is already registered as an Applicant."
        ) {
          setSnackbar({
            open: true,
            message: "Email already exists, please provide a new email ID",
            type: "error",
          });
        } else if (
          error.response.data ===
          "Mobile number is already registered as a Recruiter."
        ) {
          setSnackbar({
            open: true,
            message: "Mobile number already existed as recruiter",
            type: "error",
          });
        } else if (
          error.response.data ===
          "Mobile number is already registered as an Applicant."
        ) {
          setSnackbar({
            open: true,
            message:
              "Mobile number already exists,please provide a new mobile number",
            type: "error",
          });
        } else {
          setSnackbar({
            open: true,
            message: "Email is already registered.",
            type: "error",
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "An error occurred while sending OTP.",
          type: "error",
        });
      }
      setCandidateOTPSendingInProgress(false);
    }
  };

  const handleSubmit = async (e) => {
    if (!isFormValid1()) {
      return;
    }
    try {
      setCandidateRegistrationInProgress(true);
      const modifiedUtmSource = utmSource.includes("bitlabs.in/jobs")
        ? "Web login"
        : utmSource;
      const response = await axios.post(`${apiUrl}/applicant/saveApplicant`, {
        name: candidateName,
        email: candidateEmail1,
        mobilenumber: candidateMobileNumber,
        password: candidatePassword1,
        utmSource: modifiedUtmSource,
      });
      if (response.data === "Email is already registered.") {
        setSnackbar({
          open: true,
          message: "Email is already registered.",
          type: "error",
        });
      }
      setErrorMessage("");
      setCandidateRegistrationSuccess(true);
      setRegistrationSuccessMessage("Registration successful!");
      setActiveTab("Candidate");
      setCandidateName("");
      setCandidateEmail1("");
      setCandidateMobileNumber("");
      setCandidatePassword1("");
      setCandidateRegistrationInProgress(false);
      //  const userId = response.data.user.id;
      const email = candidateEmail1;
      const name = candidateName;
      const mobilenumber = candidateMobileNumber;
      //   const webhookUrl = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY1MDYzZTA0MzQ1MjZlNTUzNjUxMzci_pc';
      //   const webhookData = {
      //    //userId,
      //    email,
      //    name,
      //    mobilenumber,
      //    utmSource,
      //    utmMedium,
      //    utmCampaign,
      //    utmContent,
      //    utmTerm,
      //   };

      //   try {
      //     const webhookResponse = await fetch(webhookUrl, {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify(webhookData),
      //     });
      //  console.log('web hook excuted');

      //   }catch (error) {
      //     console.error('Error sending first webhook:', error);
      //     // Handle network errors or other exceptions
      //   }

      const leadData = {
        data: [
          {
            Last_Name: candidateName,
            Email: candidateEmail1,
            Phone: candidateMobileNumber,
            Status_TS: "Signed-Up",
            // Lead_Source: utmSource || "Direct", // Set a default if empty
            Industry: "Software",
            Mobile: candidateMobileNumber,
            Utm_Source_TS: utmSource || "Unknown",
            Utm_Medium_TS: utmMedium || "Unknown",
            Utm_Campaign_TS: utmCampaign || "Unknown",
            Utm_Content_TS: utmContent || "Unknown",
            Utm_Term_TS: utmTerm || "Unknown",
          },
        ],
      };



      const zohoUserId = await handleLead(leadData);
      console.log("Zoho User ID from login page :", zohoUserId);
      sessionStorage.setItem("zohoUserId", zohoUserId);

      if (candidateOTPSent && candidateOTPVerified) {
        navigate("/candidate", { state: { registrationSuccess: true } });
      }
    } catch (error) {
      setErrorMessage("Registration failed. Please try again later.");
      setCandidateRegistrationInProgress(false);
      console.error("Registration failed", error);
      if (error.response && error.response.status === 400) {
        if (error.response.data === "Email already registered") {
          setSnackbar({
            open: true,
            message: "Email already exists,please provide a new email ID",
            type: "error",
          });
        } else if (error.response.data === "Mobile number already existed") {
          setSnackbar({
            open: true,
            message:
              "Mobile number already exists,please provide a new mobile number",
            type: "error",
          });
        }
      }
    }
  };

  const isFullNameValid = (fullName) => {
    if (!fullName.trim()) {
      return "Full name is required.";
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      return "Please enter a valid full name and should not have any numbers and special char.";
    }
    if (fullName.trim().length < 3) {
      return "Full name should be at least three characters long.";
    }
    return "";
  };

  const isEmailValid = (email) => {
    if (!email.trim()) {
      return "Email is required.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org)$/i;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "aol.com",
      "mail.com",
      "icloud.com",
      "zoho.com",
      "yandex.com",
      "protonmail.com",
      "tutanota.com",
    ];

    const domain = email.trim().toLowerCase().split("@")[1];

    if (!allowedDomains.includes(domain)) {
      return "Please enter a valid email address";
    }

    return "";
  };
  const isPasswordValid = (password) => {
    if (!password.trim()) {
      return "Password is required.";
    }
    // Regular expression to match the password criteria
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!passwordRegex.test(password)) {
      return "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.";
    }

    return "";
  };
  const isMobileNumberValid = (mobilenumber) => {
    if (!mobilenumber.trim()) {
      return "Please enter a valid 10 digit mobile number";
    }
    if (!/^\d+$/.test(mobilenumber)) {
      return "Mobile number must contain only numeric digits.";
    }
    if (mobilenumber.length !== 10) {
      return "Please enter a valid 10 digit mobile number";
    }
    if (/\s/.test(mobilenumber)) {
      return "Mobile number cannot contain spaces.";
    }
    const firstDigit = mobilenumber.charAt(0);
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      return "Mobile number should begin with 6, 7, 8, or 9.";
    }
    return "";
  };
  const isFormValid = () => {
    setAllErrors(false);
    const nameError = isFullNameValid(candidateName);
    const emailError = isEmailValid(candidateEmail);
    const mobileNumberError = isMobileNumberValid(candidateMobileNumber);
    const passwordError = isPasswordValid(candidatePassword);
    setCandidateNameError(nameError);
    setCandidateEmailError(emailError);
    setCandidateMobileNumberError(mobileNumberError);
    setCandidatePasswordError(passwordError);
    return !(nameError || emailError || mobileNumberError || passwordError);
  };

  const isFormValid1 = () => {
    setAllErrors(false);
    const nameError = isFullNameValid(candidateName);
    const emailError = isEmailValid(candidateEmail1);
    const mobileNumberError = isMobileNumberValid(candidateMobileNumber);
    const passwordError = isPasswordValid(candidatePassword1);
    setCandidateNameError(nameError);
    setCandidateEmailError1(emailError);
    setCandidateMobileNumberError(mobileNumberError);
    setCandidatePasswordError1(passwordError);
    console.log("validating form1 ", passwordError);
    return !(nameError || emailError || mobileNumberError || passwordError);
  };

  const handleOTPSendSuccess = () => {
    setSnackbar({
      open: true,
      message: "OTP resend successfully",
      type: "success",
    });
    setResendOtpMessage("OTP Resent successfully. Check your email.");
  };
  const handleOTPSendFail = () => {
    setSnackbar({
      open: true,
      message: "Failed to resend OTP.Please try again.",
      type: "error",
    });
    setResendOtpMessage("Failed to Resent OTP. Please try again.");
  };

  const handleTabClick1 = (tab) => {
    setActiveTab(tab);
    if (tab === "Candidate") {
      setMessage("Welcome Back");
      console.log("login");
    } else if (tab === "Employer") {
      setMessage("Create Account");
    }
  };

  const getTabStyle = (tab) => ({
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: activeTab === tab ? "#F97316" : "transparent",
    color: activeTab === tab ? "#fff" : "#000",
    transition: "background-color 1s ease;",
    display: "inline-block",
    textAlign: "center",
    borderRadius: "4px",
    marginRight: tab === "Candidate" ? "0px" : "0",
    flex: 1,
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };
  const handleChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/\D/g, "");
    const truncatedValue = numericValue.slice(0, 10);

    if (/[^0-9]/.test(inputValue)) {
      setCandidateMobileNumberError("Mobile number should contain only digits");
    } else {
      setCandidateMobileNumber(truncatedValue);
      setCandidateMobileNumberError("");
    }
  };

  return (
    <div className="full-page">
      <div style={{ position: "relative" }}>
        <img
          src={Backgroundimagemobile}
          alt="Background"
          className="responsive-image1"
          style={{
            position: "relative",
            top: "0",
            left: "0",
            objectFit: "cover",
            zIndex: "1",
          }}
        />

        <div
          style={{
            position: "absolute",
            zIndex: "1",
            display: "flex",
            gap: "5px",
            bottom: 0,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* <h1 className="find-your">Find Your</h1>
          <h1 className="dream-job">Dream Job</h1> */}
        </div>
        <div>
          <img
            src={logo}
            alt="logo"
            className="logo-image"
            style={{
              zIndex: "1",
            }}
          />
        </div>
      </div>

      <section className="account-section">
        <div className="tf-container">
          <div className="row">
            <div className="wd-form-login">
              <section className="account-section">
                {registrationSuccess && (
                  <div className="success-message">
                    Registration successful! Please log in to continue.
                  </div>
                )}

                <div className="custom-div-style" style={{ textAlign: "left" }}>
                  {message}
                </div>
                <div className="myComponent">
                  <div
                    style={{
                      ...getTabStyle("Candidate"),
                      fontWeight: "bold",
                    }}
                    onClick={() => handleTabClick1("Candidate")}
                  >
                    Login
                  </div>

                  <div
                    style={{
                      ...getTabStyle("Employer"),
                      fontWeight: "bold",
                    }}
                    onClick={() => handleTabClick1("Employer")}
                  >
                    Sign Up
                  </div>
                </div>
                <a
                  href="javascript:void(0);"
                  class="btn-social"
                  onClick={() => login()}
                >
                  {" "}
                  <img src="images/review/google.png" alt="images" /> Continue
                  with Google
                </a>
                <br />

                <div className="content-tab">
                  <div
                    className="inner"
                    style={{
                      display: activeTab === "Candidate" ? "block" : "none",
                    }}
                  >
                    <p class="line-ip">
                      <span>or Log in using </span>
                    </p>
                    <p>
                      <span>
                        {" "}
                        {registrationSuccessMessage && (
                          <div style={{ color: "green", marginBottom: "10px" }}>
                            {registrationSuccessMessage}
                          </div>
                        )}
                      </span>
                    </p>
                    <form onSubmit={handleCandidateSubmit}>
                      <div className="ip">
                        <input
                          type="text"
                          className="name"
                          placeholder="Email"
                          value={candidateEmail}
                          onChange={(e) => {
                            setCandidateEmail(e.target.value);
                            setCandidateEmailError("");
                          }}
                        />
                        {candidateEmailError && (
                          <div className="error-message">
                            {candidateEmailError}
                          </div>
                        )}
                      </div>
                      <div className="ip">
                        <div className="inputs-group auth-pass-inputgroup">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="name"
                            placeholder="Password"
                            value={candidatePassword}
                            onChange={(e) => {
                              setCandidatePassword(e.target.value);
                              setCandidatePasswordError("");
                            }}
                          />
                          <div
                            className="password-toggle-icon"
                            onClick={handleTogglePassword}
                            id="password-addon"
                          >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                          </div>
                        </div>
                        {candidatePasswordError && (
                          <div className="error-message">
                            {candidatePasswordError}
                          </div>
                        )}
                      </div>
                      <button type="submit">Login</button>
                      <div className="group-ant-choice">
                        <div className="sub-ip"></div>
                        <a href="/applicant-forgot-password" className="forgot">
                          <br />
                          Forgot password?
                        </a>
                      </div>
                      {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                      )}
                    </form>
                    <br></br>
                  </div>

                  <div
                    className="inner"
                    style={{
                      display: activeTab === "Employer" ? "block" : "none",
                    }}
                  >
                    <p class="line-ip">
                      <span>or Sign Up using</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                      <div className="ip">
                        <input
                          type="text"
                          className="name"
                          placeholder="Name"
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
                              setCandidateName(inputValue);
                              setCandidateNameError("");
                            } else {
                              setCandidateNameError(
                                "Name should only contain alphabetic characters"
                              );
                            }
                          }}
                          required
                          disabled={allFieldsDisabled}
                        />
                        {candidateNameError && (
                          <div className="error-message">
                            {candidateNameError}
                          </div>
                        )}
                      </div>
                      <div className="ip">
                        <input
                          type="email"
                          className="name"
                          placeholder="Email"
                          value={candidateEmail1}
                          onChange={(e) => {
                            setCandidateEmail1(e.target.value);
                            setCandidateEmailError1("");
                          }}
                          required
                          disabled={allFieldsDisabled}
                        />
                        {candidateEmailError1 && (
                          <div className="error-message">
                            {candidateEmailError1}
                          </div>
                        )}
                      </div>
                      <div className="ip">
                        <form autoComplete="off">
                          <input type="text" style={{ display: "none" }} />
                          <input
                            type="text"
                            className="name"
                            placeholder="WhatsApp Number"
                            value={candidateMobileNumber}
                            onChange={handleChange}
                            required
                            disabled={allFieldsDisabled}
                            autoComplete="off"
                            name="unique_mobile_number"
                            id="unique_mobile_number"
                          />
                        </form>

                        {candidateMobileNumberError && (
                          <div className="error-message">
                            {candidateMobileNumberError}
                          </div>
                        )}
                      </div>
                      <div className="ip">
                        <div className="inputs-group auth-pass-inputgroup">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="name"
                            value={candidatePassword1}
                            onChange={(e) => {
                              setCandidatePassword1(e.target.value);
                              setCandidatePasswordError1("");
                            }}
                            required
                            disabled={allFieldsDisabled}
                          />
                          <div
                            className="password-toggle-icon"
                            onClick={handleTogglePassword}
                            id="password-addon"
                          >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                          </div>
                        </div>
                        {candidatePasswordError1 && (
                          <div className="error-message">
                            {candidatePasswordError1}
                          </div>
                        )}
                      </div>
                      {candidateOTPSent && !candidateOTPVerified ? (
                        <div>
                          <p style={{ color: "green" }}>
                            OTP sent to your email. Please check and enter
                            below:
                          </p>
                          <OTPVerification
                            email={candidateEmail1}
                            mobilenumber={candidateMobileNumber}
                            onOTPVerified={() => {
                              setTimeout(() => {
                                setCandidateOTPVerified(true);
                                setAllFieldsDisabled(true);
                              }, 0);
                              setTimeout(() => {
                                console.log(candidateOTPVerified);
                                handleSubmit();
                              }, 10);
                            }}
                            onOTPSendSuccess={handleOTPSendSuccess}
                            onOTPSendFail={handleOTPSendFail}
                            candidateOTPVerifyingInProgress={
                              candidateOTPVerifyingInProgress
                            }
                            setCandidateOTPVerifyingInProgress={
                              setCandidateOTPVerifyingInProgress
                            }
                          />
                        </div>
                      ) : (
                        <div>
                          {candidateOTPVerified ? (
                            <div style={{ color: "green" }}></div>
                          ) : (
                            <div>
                              <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={
                                  candidateOTPSent ||
                                  candidateRegistrationSuccess ||
                                  candidateOTPSendingInProgress
                                }
                                style={{ marginBottom: "10px" }}
                              >
                                {candidateOTPSendingInProgress ? (
                                  <div className="status-container">
                                    <div className="spinner"></div>
                                    <div className="status-text">
                                      Sending OTP
                                    </div>
                                  </div>
                                ) : (
                                  "Send OTP"
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <img
                    src={Background}
                    alt="Background"
                    className="responsive-image"
                    style={{
                      position: "fixed",
                      top: "0px",
                      left: "-20px",
                      paddingRight: "10px",
                    }}
                  />
                  <div className="hide">
                    <div
                      style={{
                        position: "fixed",
                        zIndex: "1",
                        flexDirection: "column",
                        gap: "20px",
                        bottom: 0,
                        justifyContent: "center",
                        width: "10%",
                        left: "5%",
                      }}
                    >
                      {/* <h1
                        className="find-your "
                        style={{ marginBottom: "-30px", fontSize: "50px" }}
                      >
                        FindYour
                      </h1>
                      <h1
                        className="dream-job "
                        style={{ marginBottom: "5px", fontSize: "50px" }}
                      >
                        DreamJob
                      </h1> */}
                    </div>
                  </div>

                  <div>
                    <img
                      src={logo}
                      alt="logo"
                      className="logo-image1"
                      style={{
                        zIndex: "1",
                      }}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
      {snackbar.open && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={handleCloseSnackbar}
          link={snackbar.link}
          linkText={snackbar.linkText}
        />
      )}
    </div>
  );
}

export default LoginBody;
