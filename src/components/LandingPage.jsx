import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Book, Users, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
  
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Navbar (if you have one) */}
        {/* Add your navbar component here if you have one */}
  
        {/* Image Strip Below Navbar */}
        <div className="w-full p-2">
          <img
            src="src/components/banner1.png" 
            alt="Campus Image"
            className="w-full h-auto" 
          />
        </div>
  
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f')] 
                       bg-cover bg-center opacity-10"
          ></div>
        </div>
  
        {/* Content */}
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 space-y-6 animate-fade-in">
              <GraduationCap className="h-20 w-20 mx-auto text-primary animate-bounce" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome to Narayana Engineering College
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Empowering future engineers with excellence in education since 2001
              </p>
            </div>
  
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Campus Connect */}
              <div className="glass-card transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">NRolEHub</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Your one-stop platform for managing and participating in campus events
                </p>
              </div>
  
              {/* Academic Excellence */}
              <div className="glass-card transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Academic Excellence</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  NAAC 'A' Grade accredited institution with top-notch faculty and facilities
                </p>
              </div>
  
              {/* Student Achievements */}
              <div className="glass-card transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Student Achievements</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Celebrating excellence in academics, sports, and extracurricular activities
                </p>
              </div>
            </div>
  
            {/* Stats Section */}
            <div className="glass-card mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    5000+
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Students</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    200+
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Faculty</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    95%
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Placement Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    50+
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Events/Year</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  