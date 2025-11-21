// -------------------- Send Message --------------------

import axiosInstance from "../../../shared/inceptron/axiosInstance";

const sendMessageApi = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/compass-g2-v1/SendEdit",
            data
        );
        return response.data;
    } catch (err) {
        // Optionally handle errors here
        if (err.response) {
            return err.response.data; // if backend sends structured err
        }
        throw err; // otherwise rethrow
    }
};

export { sendMessageApi };
