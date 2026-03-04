import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://jsonplaceholder.typicode.com",
        prepareHeaders: (headers, { getState }) => {
            return headers;
        },
    }),
    endpoints: () => ({}),
});

