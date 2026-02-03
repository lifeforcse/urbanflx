import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";
import Simulation from "./Simulation";
import AIInsights from "./AIInsights";
import CustomerWaitlist from "./CustomerWaitlist";
import About from "./About";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/waitlist" element={<CustomerWaitlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
