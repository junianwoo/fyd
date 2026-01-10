import { Link } from "react-router-dom";
import { Search, Users, Bell, ArrowRight, Phone, RefreshCw, CheckCircle, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/father-daughter.jpg";
import user1Image from "@/assets/user1.png";
import user2Image from "@/assets/user2.png";
import user3Image from "@/assets/user3.png";
import user4Image from "@/assets/user4.png";
import momDaughterImage from "@/assets/momdaughter.jpg";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <section className="relative bg-background overflow-hidden min-h-[550px] md:min-h-[650px] flex items-end">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="" 
            className="w-full h-full object-cover object-center md:object-[center_35%]"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40 md:from-black/70 md:via-black/40 md:to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 w-full pb-12 md:pb-16">
          <div className="max-w-xl text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ color: '#FFFFFF' }}>
              You're Not Searching&nbsp;Alone
            </h1>
            <p className="text-lg md:text-xl mb-8" style={{ color: '#FFFFFF' }}>
              With 2.5 million Ontarians without a family doctor, many are actively searching right now. FindYourDoctor brings the community together to help everyone find care faster.
            </p>
            <p className="text-base" style={{ color: '#FFFFFF', opacity: 0.9 }}>
              The search can feel overwhelming, but you don't have to do it alone. Our community-powered approach means every search, every phone call, and every status update helps someone else get closer to finding a doctor.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="bg-background py-20 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              How FindYourDoctor Makes Searching Easier
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Finding a family doctor in Ontario takes persistence, but FindYourDoctor helps you search smarter. Instead of calling dozens of clinics hoping for a "yes," you can see which doctors are accepting patients before you pick up the phone.
            </p>
            <p className="text-lg text-muted-foreground">
              Here's how it works, and how you can be part of a community that's helping each other find care.
            </p>
          </div>
        </div>
      </section>

      {/* Step 01: Search for Doctors */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Search className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground font-semibold">Step 01</span>
                <h2 className="text-3xl md:text-4xl text-primary">Search for Doctors in Your Area</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Enter your city or postal code to browse family doctors near you. Our map and directory show each doctor's current accepting status, so you know who to call first.
              </p>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">What You'll See:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Doctor's name and clinic location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Current accepting status (Accepting, Not Accepting, Waitlist, or Unknown)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Contact information to call the clinic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>When the status was last updated</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Why This Helps:</h3>
                <p className="text-muted-foreground">
                  Instead of calling clinic after clinic, you can focus your time on doctors who are actually accepting patients. It's not a guarantee, but it saves you from dozens of unnecessary calls.
                </p>
              </div>
              
              <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                <p className="text-foreground font-semibold">
                  Searching is completely free. No signup required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 02: Call to Confirm */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground font-semibold">Step 02</span>
                <h2 className="text-3xl md:text-4xl text-primary">Call the Clinic Directly</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                When you find a doctor who appears to be accepting patients, call their clinic to confirm. Ask if they're accepting new patients and whether you meet any specific requirements.
              </p>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-3 font-semibold">Why You Still Need to Call:</h3>
                <p className="text-muted-foreground">
                  We show you which doctors are likely accepting, but clinics manage their own patient rosters. Availability can change daily, and some doctors have specific criteria (age groups, specific conditions, geographic restrictions).
                </p>
              </div>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">What to Ask When You Call:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>"Are you accepting new patients?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>"Do you have any requirements or restrictions?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>"What's the process to register as a new patient?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span>"How soon can I get my first appointment?"</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Important Note:</h3>
                <p className="text-muted-foreground">
                  Even if a status shows "Not Accepting," circumstances can change. If you're nearby or the doctor specializes in something you need, it may still be worth a call to ask about waitlists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 03: Update Status */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground font-semibold">Step 03</span>
                <h2 className="text-3xl md:text-4xl text-primary">Help Keep Information Updated</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                This is where you help the community. After calling a clinic—whether they're accepting patients or not—take 30 seconds to update their status on FindYourDoctor.
              </p>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-3 font-semibold">Why This Matters:</h3>
                <p className="text-muted-foreground">
                  Your 30-second update saves the next person hours of searching. When everyone contributes what they learn, the whole community benefits. That's how we keep information current and helpful.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">How to Update:</h3>
                <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                  <li>Find the doctor's listing</li>
                  <li>Click "Update Status"</li>
                  <li>Select the current status</li>
                  <li>Submit (no account required)</li>
                </ol>
              </div>
              
              <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                <h3 className="text-lg text-foreground mb-2 font-semibold">You're Helping Someone:</h3>
                <p className="text-muted-foreground">
                  When you update a status, someone else searching tomorrow won't waste time calling a clinic that's closed to new patients. You're paying forward the help you received from the last person who updated before you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional: Alert Service */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Bell className="h-8 w-8 text-accent" />
              </div>
              <div>
                <span className="text-sm text-accent font-semibold">Optional</span>
                <h2 className="text-3xl md:text-4xl text-primary">Subscribe to Alert Service</h2>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground">
                If you want to be notified the moment a doctor starts accepting patients, you can subscribe to our Alert Service. Get email alerts for up to 3 cities so you never miss an opportunity.
              </p>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">How Alert Service Works:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Choose up to 3 Ontario cities to monitor with optional language and accessibility filters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Receive email alerts when a doctor's status changes to "Accepting"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Set optional filters to only receive alerts for doctors with specific languages or accessibility features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Email includes doctor's name, clinic location, contact info, and distance from city center</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Act fast—you'll be among the first to know</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>$7.99/month, cancel anytime</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-3 font-semibold">Who Alert Service Is For:</h3>
                <p className="text-muted-foreground">
                  Alert Service is designed for people who are actively searching for a family doctor—whether for themselves or for loved ones in other cities. Many subscribers use alerts to help aging parents, family members, or friends find doctors in their area.
                </p>
              </div>
              
              <div className="bg-secondary/5 p-6 rounded-lg border border-secondary/20">
                <p className="text-foreground font-semibold mb-2">Free Search Still Works:</p>
                <p className="text-muted-foreground">
                  You don't need Alert Service to use FindYourDoctor. Searching is always free, and you can check as often as you like. Alert Service just automates the checking for you.
                </p>
              </div>
              
              <div className="text-center">
                <Button size="lg" asChild>
                  <Link to="/pricing">Learn More About Alert Service</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Model */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                Community-Powered, Always Current
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                FindYourDoctor works because it's built on community participation. We don't scrape outdated directories or wait months between updates. Our information stays current because real people—just like you—share what they learn.
              </p>
            </div>
            
            <div className="space-y-16">
              {/* Step 1 */}
              <div className="relative">
                <div className="md:ml-32">
                  <div className="bg-card p-6 md:pl-40 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-secondary">1</span>
                      </div>
                      <h3 className="text-xl text-foreground">Someone searches and calls a clinic</h3>
                    </div>
                    <p className="text-muted-foreground ml-13">
                      They learn whether the doctor is accepting patients right now.
                    </p>
                  </div>
                </div>
                <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-52 w-40 mx-auto md:mx-0 -mt-4 md:mt-0 z-10">
                  <img 
                    src={user1Image} 
                    alt="Person calling clinic" 
                    className="w-full h-auto drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="md:ml-32">
                  <div className="bg-card p-6 md:pl-40 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-secondary">2</span>
                      </div>
                      <h3 className="text-xl text-foreground">They update the status on FindYourDoctor</h3>
                    </div>
                    <p className="text-muted-foreground ml-13">
                      Takes 30 seconds. No account required.
                    </p>
                  </div>
                </div>
                <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-52 w-40 mx-auto md:mx-0 -mt-4 md:mt-0 z-10">
                  <img 
                    src={user2Image} 
                    alt="Person updating status" 
                    className="w-full h-auto drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="md:ml-32">
                  <div className="bg-card p-6 md:pl-40 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-secondary">3</span>
                      </div>
                      <h3 className="text-xl text-foreground">The next person searching sees current information</h3>
                    </div>
                    <p className="text-muted-foreground ml-13">
                      They save time by knowing who to call first.
                    </p>
                  </div>
                </div>
                <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-52 w-40 mx-auto md:mx-0 -mt-4 md:mt-0 z-10">
                  <img 
                    src={user3Image} 
                    alt="Person viewing updated information" 
                    className="w-full h-auto drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="md:ml-32">
                  <div className="bg-card p-6 md:pl-40 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-secondary">4</span>
                      </div>
                      <h3 className="text-xl text-foreground">The cycle continues</h3>
                    </div>
                    <p className="text-muted-foreground ml-13">
                      Every person who updates helps the next person searching.
                    </p>
                  </div>
                </div>
                <div className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 md:w-52 w-40 mx-auto md:mx-0 -mt-4 md:mt-0 z-10">
                  <img 
                    src={user4Image} 
                    alt="Community cycle" 
                    className="w-full h-auto drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Guide */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                What Each Status Means
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border-l-4 border-status-accepting">
                <h3 className="text-xl text-foreground mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-accepting"></div>
                  Accepting New Patients
                </h3>
                <p className="text-muted-foreground">
                  The doctor is currently accepting new patients. Call soon—rosters can fill quickly.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border-l-4 border-status-not-accepting">
                <h3 className="text-xl text-foreground mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-not-accepting"></div>
                  Not Accepting Patients
                </h3>
                <p className="text-muted-foreground">
                  The doctor's roster is full and they're not taking new patients right now. This can change, but it may be weeks or months.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border-l-4 border-status-waitlist">
                <h3 className="text-xl text-foreground mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-waitlist"></div>
                  Waitlist Available
                </h3>
                <p className="text-muted-foreground">
                  The roster is full, but you can join a waitlist. Ask the clinic how long the wait typically is.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border-l-4 border-muted">
                <h3 className="text-xl text-foreground mb-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  Status Unknown
                </h3>
                <p className="text-muted-foreground">
                  We don't have current information. This usually means no one has called recently. You could be the first to update it.
                </p>
              </div>
            </div>
            
            <div className="mt-8 bg-accent/10 p-6 rounded-lg border border-accent/20">
              <p className="text-foreground">
                <strong>When Status Was Updated:</strong> Each listing shows when the status was last confirmed. More recent updates are more reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Questions Answered */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                Your Questions Answered
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">Do I have to create an account to search?</h3>
                <p className="text-muted-foreground">
                  No. Searching is completely free and requires no signup. Just visit the site, enter your location, and start browsing doctors.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">Is the information really accurate?</h3>
                <p className="text-muted-foreground">
                  Our accuracy depends on community participation. The more people update statuses after calling clinics, the more current the information stays. We show when each status was last updated so you can decide how much to trust it.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">What if the status is wrong when I call?</h3>
                <p className="text-muted-foreground">
                  Things can change quickly. If you find incorrect information, please update the status after your call. That's how we keep the community informed.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">Can I search without subscribing to alerts?</h3>
                <p className="text-muted-foreground">
                  Absolutely. Searching is free forever. Alerts are optional for people who want automated notifications.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">How quickly do alerts go out?</h3>
                <p className="text-muted-foreground">
                  Email alerts are sent within minutes of a status change. This gives you a time advantage to call before the roster fills.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl text-foreground mb-3">What if no doctors near me are accepting?</h3>
                <p className="text-muted-foreground">
                  This is common right now. Consider setting up alerts for your area so you're notified the moment someone starts accepting. Also, try expanding your search radius or checking back regularly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                How to Improve Your Chances
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Be Persistent</h3>
                <p className="text-muted-foreground">
                  Finding a family doctor often takes time. Check regularly, call promptly when you see "Accepting" status, and don't get discouraged.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Expand Your Search Area</h3>
                <p className="text-muted-foreground">
                  If your immediate area has no accepting doctors, widen your radius. Some people travel 30+ minutes to see their family doctor.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Call Early in the Day</h3>
                <p className="text-muted-foreground">
                  Clinic phone lines are often busiest mid-morning. Try calling right when they open or in early afternoon.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Ask About Waitlists</h3>
                <p className="text-muted-foreground">
                  Even if a doctor isn't accepting, ask if they have a waitlist. Some waitlists move faster than others.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Consider New Doctors</h3>
                <p className="text-muted-foreground">
                  Newly graduated doctors or doctors new to an area are more likely to be accepting patients. They're just as qualified.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Register with Available Services</h3>
                <p className="text-muted-foreground">
                  While you search on FindYourDoctor, also register with provincial or regional programs. Use every tool available.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg text-foreground mb-2 font-semibold">Help Others While You Search</h3>
                <p className="text-muted-foreground">
                  Update every status after you call. The community you help today will help you tomorrow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Data */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                Your Privacy Matters
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-foreground mb-3">What We Collect:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Search location (city/postal code)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>For alert subscribers: email address and monitored cities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>Anonymous usage data to improve the site</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">What We Don't Collect:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-status-not-accepting flex-shrink-0 mt-0.5" />
                    <span>Your medical information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-status-not-accepting flex-shrink-0 mt-0.5" />
                    <span>Your personal health details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-status-not-accepting flex-shrink-0 mt-0.5" />
                    <span>Your phone calls or conversations with clinics</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl text-foreground mb-3">How We Use Information:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>To show you relevant doctors near you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>To send you email alerts (if subscribed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                    <span>To improve the site for everyone</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <p className="text-foreground">
                  Your search history is yours. We don't sell data. We don't share personal information.
                </p>
                <div className="mt-4">
                  <Link to="/privacy" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                    Read Full Privacy Policy <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Ready to Start Your Search?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thousands of Ontarians are searching right now. Join the community and help each other find care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Start Searching Now</h3>
              <p className="text-muted-foreground mb-6">
                Browse doctors, see who's accepting, call clinics.
              </p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  No signup required
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Always free
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Instant access
                </li>
              </ul>
              <Button size="lg" className="w-full" asChild>
                <Link to="/doctors">Start Your Search</Link>
              </Button>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Get Notified Instantly</h3>
              <p className="text-muted-foreground mb-6">
                Monitor up to 3 cities and receive alerts when doctors start accepting.
              </p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  $7.99/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Cancel anytime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Time advantage
                </li>
              </ul>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Encouraging Hope */}
      <section className="relative bg-background py-12 md:py-16 overflow-hidden md:min-h-[400px]">
        {/* Background image - hidden on mobile */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <img 
            src={momDaughterImage} 
            alt="Mother and daughter" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-center justify-center md:justify-end">
          <div className="max-w-lg text-left animate-fade-in md:mr-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-tight" style={{ color: '#0F4C5C' }}>
              You Will Find a Doctor
            </h2>
            <p className="text-lg mb-6" style={{ color: '#0F4C5C' }}>
              The search takes time, and it can feel discouraging. But doctors do accept new patients every week. When you combine FindYourDoctor's community updates with persistence and a bit of luck, you improve your chances.
            </p>
            <p className="text-lg mb-6" style={{ color: '#0F4C5C' }}>
              You're part of a community of people helping each other navigate this challenge. Every status update, every search, and every shared bit of information moves everyone closer to finding care.
            </p>
            <p className="text-xl font-semibold" style={{ color: '#0F4C5C' }}>
              Keep searching. Stay hopeful. We're here to help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
