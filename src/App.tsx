import { BrowserRouter, Routes, Route } from "react-router-dom";
// @ts-ignore
import Menu from "./Components/Menu";
// @ts-ignore
import Home from "./Components/home";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/MM" element={<Menu />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;