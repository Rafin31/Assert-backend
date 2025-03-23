import axios from 'axios';

// Persistent cache across calls
const cache = {};

export const getFixturesByDateRange = async (req, res) => {
    const { date_from, date_to } = req.query;

    if (!date_from || !date_to) {
        return res.status(400).json({
            success: false,
            message: "Both 'date_from' and 'date_to' are required.",
        });
    }

    const key = `${date_from}_${date_to}`;
    const now = Date.now();

    // Use existing cache if it's less than 2 minute old
    if (cache[key] && now - cache[key].timestamp < 2 * 60 * 1000) {
        return res.status(200).json({
            success: true,
            source: 'cache',
            data: cache[key].data,
        });
    }

    const url = `https://api.sportmonks.com/v3/football/fixtures/between/${date_from.trim()}/${date_to.trim()}?include=scores&include=league`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: process.env.FOOTBALL_TOKEN,
            },
        });

        // Store result in cache
        cache[key] = {
            data: response.data.data,
            timestamp: now,
        };

        return res.status(200).json({
            success: true,
            source: 'live',
            count: response.data.data.length,
            data: response.data.data,
        });
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch fixtures',
            error: error.response?.data?.message || error.message || 'Unknown error',
        });
    }
};
