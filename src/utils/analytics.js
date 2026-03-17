import { apiUrl } from '../services/ApplicantAPIService';
const track = (feature, userId) => {
  fetch(`${apiUrl}/api/analytics/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      feature,
      
      userId
      //timestamp: today,
    }),
  }).catch((err) => {
  console.error("Analytics API failed:", err);
});
};
 
export default { track };
