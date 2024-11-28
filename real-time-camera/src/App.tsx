// App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router và Routes
import RealTimeCamera from "./component/RealTimeCamera";
import UploadImage from "./component/UploadImage";  // Import trang UploadImage

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RealTimeCamera />} />
        <Route path="/upload" element={<UploadImage />} />
      </Routes>
    </Router>
  );
};

export default App;
