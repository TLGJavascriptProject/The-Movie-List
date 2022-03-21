const fetch = require('node-fetch');

exports.get_now_playing = async(uri) => {
    let data = [];
    try {
        const response = await fetch(uri);
        if (!response.ok) {
            throw new Error(response.status);
        }
        const responseData = await response.json();
        data = responseData.results;
    } catch (error) {
        console.error(error);
    }
    return data;
}