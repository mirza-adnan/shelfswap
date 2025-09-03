import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/book-exchange-hero.jpg';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Swap Your Books,
              <span className="text-accent block">Build Your Library</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow book lovers and exchange the books you've read for the ones you're dying to read. 
              It's sustainable, social, and completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/auth?mode=signup" className="flex items-center space-x-2">
                  <span>Start Swapping</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/auth">I Have an Account</Link>
              </Button>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Book exchange illustration" 
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How ShelfSwap Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start exchanging books with readers around you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Build Your Shelf</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add books you own to your shelf and create a wishlist of books you want to read.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-secondary-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Find Matches</h3>
              <p className="text-muted-foreground leading-relaxed">
                We'll match you with readers who have books you want and want books you have.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Make the Swap</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with your match and arrange to exchange books. Happy reading!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Ready to Start Your Book Exchange Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of book lovers who are sharing stories and discovering new reads.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth?mode=signup" className="flex items-center space-x-2">
                <span>Join ShelfSwap Today</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;