import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex justify-between items-center px-8 py-6 border-b">
        <div className="text-2xl font-bold tracking-tight themer-gradient">Themer</div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-1 flex-col justify-center items-start px-16 max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to <span className="themer-gradient">Themer</span></h1>
          <p className="text-lg mb-8 text-gray-600">Craft welcoming, localized in-flight entertainment experiences for your passengers. Effortlessly create and manage themes tailored to every destination.</p>
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-blue-700 transition"
            onClick={() => navigate('/dashboard')}
          >
            Create themes
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="/logo192.png" alt="Themer illustration" className="w-96 h-96 object-contain" />
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 