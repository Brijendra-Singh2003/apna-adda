import { ArrowRight, Server, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <img className="absolute object-cover object-center h-full w-full" src='/hero-bg.jpg' />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <h1 className="text-6xl md:text-8xl font-bold text-blue-600 mb-6 tracking-tight">
          Our Base
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted shadow-sm mb-8 font-light">
          Create servers. Join worlds. Build together.
        </p>
        
        {/* Description */}
        <p className="text-muted shadow-sm text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          A 2D top-down multiplayer platform where you can create your own servers 
          and join others in building amazing worlds together.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-accent-foreground rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-accent" />
            </div>
            <span className="text-muted shadow-sm">Create Servers</span>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-accent-foreground rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <span className="text-muted shadow-sm">Join Communities</span>
          </div>
          
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-accent-foreground rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <span className="text-muted shadow-sm">Real-time Play</span>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link 
          to="/play"
          className="group inline-flex items-center space-x-2 bg-blue-600 text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span>Enter Dashboard</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-background">1.2K+</div>
            <div className="text-sm text-muted shadow-sm">Servers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-background">15K+</div>
            <div className="text-sm text-muted shadow-sm">Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-background">50K+</div>
            <div className="text-sm text-muted shadow-sm">Worlds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;