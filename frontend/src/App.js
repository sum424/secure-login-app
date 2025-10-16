import React from 'react';
import LoginForm from './components/LoginForm';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Success from './components/Success';

function App(){
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4 text-center">Secure Login</h3>
              <Router>
                <Routes>
                  <Route path="/" element={<LoginForm />} />
                  <Route path="/success" element={<Success />} />
                </Routes>
              </Router>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
