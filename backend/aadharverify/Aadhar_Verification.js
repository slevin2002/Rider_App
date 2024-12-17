import express from 'express';
import axios from 'axios';
import fs from 'fs';
import cors from 'cors';

const router = express.Router();
router.use(express.json());
router.use(cors());

// Helper functions to manage JWT
function storeJwt(jwt) {
    const data = {
        jwt,
        timestamp: Date.now(),
    };
    fs.writeFileSync('jwt_storage.json', JSON.stringify(data));
}

function getStoredJwt() {
    if (fs.existsSync('jwt_storage.json')) {
        const data = JSON.parse(fs.readFileSync('jwt_storage.json'));
        return data;
    }
    return null;
}

async function getAuthToken() {
    const storedJwt = getStoredJwt();
    if (storedJwt && (Date.now() - storedJwt.timestamp) < 3600000) {  // Assuming token expires in 1 hour
        return storedJwt.jwt;
    }

    // Fetch a new token if expired or not present
    try {
        const url = 'https://api.sandbox.co.in/authenticate';
        const headers = {
            'accept': 'application/json',
            'x-api-key': 'key_live_xYcfliyV8niNSo6kZsS1970EDCQvmkpc',
            'x-api-secret': 'secret_live_XYuFddHuCNmMAbPdPN55JLenj4znydwt',
            'x-api-version': '1.0',
        };

        const response = await axios.post(url, {}, { headers });
        const authToken = response.data.access_token;
        storeJwt(authToken);
        return authToken;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

// Endpoint to send OTP
router.post('/aadhaar/sendotp', async (req, res) => {
    const { aadhaar_no } = req.body;

    console.log("Received sendotp request with aadhaar_no:", aadhaar_no);

    const authToken = await getAuthToken();
    if (!authToken) {
        console.error("Failed to generate auth token");
        return res.status(500).send({ error: 'Failed to generate auth token' });
    }

    try {
        const response = await axios.post('https://api.sandbox.co.in/kyc/aadhaar/okyc/otp', {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
            consent: "y",
            reason: "For KYC",
            aadhaar_number: aadhaar_no,
        }, {
            headers: {
                'accept': 'application/json',
                'authorization': authToken,
                'content-type': 'application/json',
                'x-api-key': 'key_live_xYcfliyV8niNSo6kZsS1970EDCQvmkpc',
                'x-api-version': '2.0',
            },
        });

        console.log("OTP request response:", response.data); 
         // Log full response for debugging
        res.json(response.data);
    } catch (error) {
        console.error("Error sending OTP:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: error.message });
    }
});

// Endpoint to verify OTP
router.post('/aadhaar/verifyotp', async (req, res) => {
    const { reference_id, otp } = req.body;
    const formattedReferenceId = String(reference_id); 
    console.log(req.body);

    const authToken = await getAuthToken();
    if (!authToken) {
        console.error("Failed to generate auth token");
        return res.status(500).send({ error: 'Failed to generate auth token' });
    }

    try {

        const options = {
          method: 'POST',
          url: 'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
          headers: {
            accept: 'application/json',
            authorization: authToken,
            'x-api-key': 'key_live_xYcfliyV8niNSo6kZsS1970EDCQvmkpc',
            'x-api-version': '2.0',
            'content-type': 'application/json'
          },
          data: {
            '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
            reference_id: formattedReferenceId,
            otp: otp
          }
        };
        
        axios
          .request(options)
          .then(function (response) {
            console.log(response.data)
            res.json(response.data);
          })
          .catch(function (error) {
            console.error(error);
          });
    } catch (error) {
        console.error("Error verifying OTP:", error.response ? error.response.data : error.message);
        res.status(500).send({ error: error.response ? error.response.data : error.message });
    }
});

// Exporting the router as default
export default router;
