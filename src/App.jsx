import { useMemo } from "react";
import styled from "styled-components";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useGetDarkmode } from "./shared/hooks/useGetDarkmode";
import ProtectedRouts from "./components/auth/gurd/Protected.Routs";
import AppLayout from "./shared/ui/AppLayout";
import CompassAIV1 from "./components/compassAI-v1/compassAI-v1";
import CompassAIV2 from "./components/CompassAI-V2/CompassAI-V2";
import CompassAIV3 from "./components/CompassAI-V3/CompassAI-V3";
const AppContainer = styled.div`
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
`;

const routs = createBrowserRouter([
    {
        element: <ProtectedRouts />,
        children: [
            {
                path: "/",
                element: (
                    <AppContainer>
                        <AppLayout />
                    </AppContainer>
                ),
                children: [
                    {
                        index: true,
                        element: <CompassAIV1 />,
                    },
                    { path: "/CompassAI-V1", element: <CompassAIV1 /> },
                    { path: "/CompassAI-V2", element: <CompassAIV2 /> },
                    { path: "/CompassAI-V3", element: <CompassAIV3 /> },
                ],
            },
        ],
    },
    // {
    //     index: true,
    //     element: <Navigate to="/dashboard" replace />,
    // },
]);
function App() {
    const { mode } = useGetDarkmode();
    let currentMode = "dark";
    mode === "dark" ? (currentMode = "dark") : (currentMode = "light");
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: currentMode,
                },
            }),
        [currentMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={routs}></RouterProvider>
        </ThemeProvider>
    );
}

export default App;
