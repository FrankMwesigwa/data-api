import express from "express";
import axios from 'axios';

const router = express.Router();

const serverUrl = 'https://api-uat.integration.go.ug/token';

router.post("/", async (req, res) => {
    try {
        const response = await axios.post(`${serverUrl}`,
            { grant_type: 'client_credentials' },
            {
                headers: {
                    Authorization: 'Basic VmFOTVNYSjBZQ1VZOWg1cVJ0SFFoRG5JaVJvYTptUG41WUZ4VHBabFZEeFZIYzBkQXVTU2RxWVVh'
                }
            }
        );

        res.json(response);
    } catch (error) {
        if (error.response) {
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        return null;
    }
});

export default router;
