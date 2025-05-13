import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation'; // Corrected path

function Footer() {
  const t = useTranslation();
  
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1 - Product */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.product}</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-600 hover:text-primary text-sm">{t.features}</a></li>
              <li><a href="#ai-analysis" className="text-gray-600 hover:text-primary text-sm">{t.aiAnalysis}</a></li>
              <li><a href="#data-collection" className="text-gray-600 hover:text-primary text-sm">{t.dataCollection}</a></li>
              <li><a href="#analytics" className="text-gray-600 hover:text-primary text-sm">{t.analyticsDashboard}</a></li>
              <li><a href="#integrations" className="text-gray-600 hover:text-primary text-sm">{t.integrations}</a></li>
              <li><a href="#security" className="text-gray-600 hover:text-primary text-sm">{t.security}</a></li>
            </ul>
          </div>

          {/* Column 2 - Solutions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.solutions}</h3>
            <ul className="space-y-3">
              <li><a href="#government" className="text-gray-600 hover:text-primary text-sm">{t.government}</a></li>
              <li><a href="#smart-cities" className="text-gray-600 hover:text-primary text-sm">{t.smartCities}</a></li>
              <li><a href="#utilities" className="text-gray-600 hover:text-primary text-sm">{t.utilities}</a></li>
              <li><a href="#infrastructure" className="text-gray-600 hover:text-primary text-sm">{t.infrastructure}</a></li>
              <li><a href="#damage-assessment" className="text-gray-600 hover:text-primary text-sm">{t.damageAssessment}</a></li>
              <li><a href="#urban-planning" className="text-gray-600 hover:text-primary text-sm">{t.urbanPlanning}</a></li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.resources}</h3>
            <ul className="space-y-3">
              <li><a href="#documentation" className="text-gray-600 hover:text-primary text-sm">{t.documentation}</a></li>
              <li><a href="#guides" className="text-gray-600 hover:text-primary text-sm">{t.guides}</a></li>
              <li><a href="#case-studies" className="text-gray-600 hover:text-primary text-sm">{t.caseStudies}</a></li>
              <li><a href="#webinars" className="text-gray-600 hover:text-primary text-sm">{t.webinars}</a></li>
              <li><a href="#blog" className="text-gray-600 hover:text-primary text-sm">{t.blog}</a></li>
              <li><a href="#help-center" className="text-gray-600 hover:text-primary text-sm">{t.helpCenter}</a></li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.company}</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-gray-600 hover:text-primary text-sm">{t.aboutUs}</a></li>
              <li><a href="#leadership" className="text-gray-600 hover:text-primary text-sm">{t.leadership}</a></li>
              <li><a href="#customers" className="text-gray-600 hover:text-primary text-sm">{t.customers}</a></li>
              <li><a href="#partners" className="text-gray-600 hover:text-primary text-sm">{t.partners}</a></li>
              <li><a href="#careers" className="text-gray-600 hover:text-primary text-sm">{t.careers}</a></li>
              <li><a href="#contact" className="text-gray-600 hover:text-primary text-sm">{t.contactUs}</a></li>
            </ul>
          </div>

          {/* Column 5 - Get Started */}
          <div className="md:border-l md:border-gray-300 md:pl-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t.getStarted}</h3>
            <div className="space-y-4">
              <a href="#try-demo" className="block w-full px-4 py-2 border border-primary text-primary text-center rounded-md hover:bg-primary hover:text-white transition-colors">
                {t.tryDemo}
              </a>
              <a 
                href="http://localhost:3000/app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-center rounded-md hover:opacity-90 transition-colors"
              >
                {t.signUp}
              </a>
              <div className="pt-4">
                <div className="flex space-x-4">
                  <a href="#twitter" className="text-gray-600 hover:text-primary">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#linkedin" className="text-gray-600 hover:text-primary">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="#facebook" className="text-gray-600 hover:text-primary">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#youtube" className="text-gray-600 hover:text-primary">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-sm text-gray-500">{t.copyright}</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="#privacy" className="text-sm text-gray-500 hover:text-primary">{t.privacy}</a>
              <a href="#terms" className="text-sm text-gray-500 hover:text-primary">{t.terms}</a>
              <a href="#cookies" className="text-sm text-gray-500 hover:text-primary">{t.cookiePreferences}</a>
              <a href="#privacy-choices" className="text-sm text-gray-500 hover:text-primary">{t.yourPrivacyChoices}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 