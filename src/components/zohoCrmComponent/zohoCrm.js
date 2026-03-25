import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';

function ZohoCRMService() {
  const createLead = async (leadData) => {
    try {
      const response = await axios.post(`${apiUrl}/zoho/create-lead`, leadData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log("response", response.data?.data?.[0].details.id);
      if (response.status === 200 || response.status === 201) {
       
        // console.log("Lead submitted successfully", res.data[0].details.id);

        return response.data?.data?.[0].details.id || null;
      } else {
        console.error("Failed to submit lead", response.data);
        return null;
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      console.error("Error submitting lead:", errorMessage);
      throw new Error(`Failed to create lead: ${errorMessage}`);
    }
  };

  const searchLead = async (email) => {
    if (!email) {
      console.error("Email is required for searching leads");
      return null;
    }

    try {
      const response = await axios.get(`${apiUrl}/zoho/searchlead/${encodeURIComponent(email)}`);

      if (response.status === 200 || response.status === 201) {
        const leadId = response.data?.data?.[0]?.id || null;
        console.log("Lead search result:", leadId ? "Found" : "Not found");
        return leadId;
      } else {
        console.error("Failed to find lead", response.data);
        return null;
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      console.error("Error finding lead:", errorMessage);
      throw new Error(`Failed to search lead: ${errorMessage}`);
    }
  };

  //retry on failure
  const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; //exponential bckoff 
        }
      }
    }
    
    throw lastError;
  };

  const handleLead = async (leadData, retryOptions = { maxRetries: 3, delay: 1000 }) => {
    if (!leadData || !leadData.data || !leadData.data[0] || !leadData.data[0].Email) {
      console.error("Invalid lead data structure");
      return null;
    }
 
    try {
      const email = leadData.data[0].Email;
     
      const zohoUserId = await retryOperation(
        async () => await searchLead(email),
        retryOptions.maxRetries,
        retryOptions.delay
      );
 
      if (zohoUserId) {
        console.log("Lead already exists with ID:", zohoUserId);
        return zohoUserId;
      } else {
        console.log("Creating new lead...");
        const id  = await retryOperation(
          async () => await createLead(leadData),
          retryOptions.maxRetries,
          retryOptions.delay
        );
 
        return id ;
      }
    } catch (error) {
      console.error("Error handling lead after all retry attempts:", error.message);
      return null;
    }
  };
 

  return {
    createLead,
    searchLead,
    handleLead,
    retryOperation
  };
}

export default ZohoCRMService;