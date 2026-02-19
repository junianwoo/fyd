import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import coupleFooterImage from "@/assets/couple-footer.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            About FindYourDoctor.ca
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We started FindYourDoctor.ca because finding a family doctor in Ontario feels like a full-time job — and most people don't have time for that.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8 text-foreground">
              
              {/* Section 1 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Over 2.5 million Ontarians are without a family doctor. We provide a centralized, up-to-date directory of family medicine clinics across Ontario, making it easier for residents to find care in their communities.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">How It Works</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We maintain a comprehensive database of family medicine clinics throughout Ontario by aggregating information from multiple authoritative sources:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Ontario Ministry of Health public databases</li>
                  <li>Regional health network clinic directories</li>
                  <li>Verified clinic contact information</li>
                  <li>Community-reported updates</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform displays clinic locations, contact details, and current accepting status, helping patients make informed decisions about where to seek care.
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">Our Approach to Data</h2>
                
                <h3 className="text-xl text-foreground mb-3">Comprehensive Coverage</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We monitor thousands of family medicine clinics across all Ontario health regions, from major urban centers to rural communities.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Regular Updates</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our core database undergoes monthly verification and updates. Community-reported changes are reviewed and integrated to ensure current information.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Transparency</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Each clinic listing includes the date information was last verified. Accepting statuses are marked as "Unknown" until confirmed through community reports or direct verification.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Community-Driven</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We rely on Ontarians to report when clinics change their accepting status. This community participation helps keep information current and benefits all users searching for care.
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">Our Commitment</h2>
                
                <h3 className="text-xl text-foreground mb-3">Free &amp; Accessible</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  No fees or registration requirements to search, available to all Ontarians. We offer optional Alert Service for those who wish to receive email alerts regarding clinic status updates.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Privacy-First</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We do not collect personal health information. See our{" "}
                  <Link href="/privacy" className="text-secondary hover:text-primary">
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Transparent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Clear data sources, update frequencies, and methodology.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Community-Focused</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built to serve Ontarians navigating the healthcare system.
                </p>
              </div>

              {/* Who Built This */}
              <div>
                <h2 className="text-2xl text-primary mb-4">Who Built This</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca was built by a hospital worker in Ontario who spent four years on the Health Care Connect registry without ever being matched with a family doctor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  I'm not a software engineer, a startup founder, or a government agency. I'm someone who works inside the healthcare system, watched my own parents move provinces and lose access to a family doctor, and decided to build something useful — even if it meant teaching myself to code to do it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  The idea is simple: 2,699 family medicine clinics across Ontario, organized in one place, updated by the community. If everyone who calls a clinic shares what they find, we all spend less time on hold and more time getting care. That's it. That's the whole product.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">Data Quality &amp; Verification</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We source clinic information from official health databases and public records. While we make every effort to maintain accurate information, we encourage users to contact clinics directly to confirm their current accepting status. Healthcare availability changes frequently, and direct verification ensures the most current information.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All clinic data includes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Verified contact information from multiple sources</li>
                  <li>Geographic coordinates from authoritative databases</li>
                  <li>Last updated timestamps for transparency</li>
                  <li>Clear indicators when information status is unknown</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-background-alt pt-8 md:pt-12 overflow-visible">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-end justify-center gap-8">
            <div className="text-center md:text-left mb-8 md:mb-0 self-center">
              <h2 className="text-2xl text-primary mb-4">
                Questions or Feedback?
              </h2>
              <p className="text-muted-foreground mb-6">
                We'd love to hear from you. Get in touch with our team.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center text-secondary hover:text-primary transition-colors font-semibold"
              >
                Contact Us <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {/* Image at bottom, flush with no bottom padding */}
            <div className="flex justify-end flex-shrink-0">
              <img 
                src={coupleFooterImage.src} 
                alt="Community connecting" 
                className="w-full max-w-2xl h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
