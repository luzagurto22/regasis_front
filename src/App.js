import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FacialRecognition from "./pages/FacialRecognition";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<FacialRecognition />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
