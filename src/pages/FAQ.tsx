import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import coupleFooterImage from "@/assets/couple-footer.png";

const faqCategories = [
  {
    title: "About FindYourDoctor.ca",
    faqs: [
      {
        question: "What is FindYourDoctor.ca?",
        answer: "FindYourDoctor.ca is a community-driven service that helps Ontarians find family doctors accepting new patients. We provide a free, searchable directory of family practice clinics across Ontario with real-time accepting status information. Our platform is built to address the healthcare access crisis affecting approximately 2.5 million Ontarians who currently lack access to primary care physicians.",
      },
      {
        question: "Why do you show clinics instead of individual doctors?",
        answer: "We focus on clinics rather than individual doctors because this approach is more accurate, scalable, and easier to maintain. When you call a family practice, you're typically seeking any available doctor at that clinic, not a specific physician. By focusing on clinic-level status (whether the practice is accepting new patients), we can provide more reliable, up-to-date information without the complexity of tracking hundreds of individual doctors who may join, leave, or change their patient loads. This means you get faster, more accurate results and we can cover more of Ontario effectively.",
      },
      {
        question: "Are you affiliated with the government or CPSO?",
        answer: "No. We are not affiliated with, endorsed by, or connected to any government agency, the Ontario Ministry of Health, the College of Physicians and Surgeons of Ontario (CPSO), or any other healthcare authority. We are an independent service built to help Ontarians navigate the family doctor shortage more effectively.",
      },
      {
        question: "How do you keep clinic information up-to-date?",
        answer: "We use a community-powered model where users voluntarily update clinic status after calling them. When someone calls a clinic and learns whether they're accepting patients, they can share that information on FindYourDoctor to help others. Additionally, clinics can claim and verify their own listings to ensure accuracy. We display when each listing was last updated and who verified it (community or clinic staff) so you can assess the reliability of the information.",
      },
      {
        question: "How accurate is the clinic status information?",
        answer: "Our accuracy depends on community participation and clinic verification. The more people who update statuses after calling clinics, the more current our information stays. We show when each status was last updated so you can decide how much to trust it. While we strive for accuracy, clinic acceptance status can change at any time, so we always recommend calling the clinic directly to confirm before making healthcare decisions.",
      },
      {
        question: "What if the status is wrong when I call?",
        answer: "Things can change quickly in busy medical practices. If you find incorrect information, please take 30 seconds to update the status after your call. Your update helps the next person searching and keeps our community informed. This is how we maintain current information for everyone's benefit.",
      },
      {
        question: "Can clinics update their own listings?",
        answer: "Yes. Clinic staff can claim their listings through an email verification process. Once verified, they can update their practice information, accepting status, languages spoken, accessibility features, and other details directly. Listings updated by verified clinics are marked as \"Clinic Verified\" to indicate direct provider confirmation.",
      },
    ],
  },
  {
    title: "Using Free Search",
    faqs: [
      {
        question: "Is searching really free forever?",
        answer: "Yes. Searching our clinic directory is completely free and always will be. You can browse clinics, see who's accepting patients, view contact information, use the interactive map, and access all basic features without creating an account or paying anything. No hidden fees, no trial periods, no credit card required. We believe everyone should have access to this essential healthcare information.",
      },
      {
        question: "Do I need to create an account to search?",
        answer: "No. You can search and view all clinic listings without creating an account. Just visit the site, enter your location, and start browsing clinics. An account is only needed if you want to subscribe to the Alert Service for email notifications or apply for Assisted Access.",
      },
      {
        question: "Is there a limit to how many searches I can do?",
        answer: "No limits. Search as often as you like, for as many cities as you want. You can use the service every day without any restrictions or costs.",
      },
      {
        question: "Can I update a clinic's status without an account?",
        answer: "Yes! We encourage everyone to help keep listings accurate, and you don't need an account to do so. After calling a clinic, you can submit a status update. Your 30-second update helps someone else find care faster and strengthens our community.",
      },
      {
        question: "What if no doctors near me are accepting patients?",
        answer: "This is unfortunately common right now due to the healthcare crisis. We recommend: (1) Setting up Alert Service to be notified the moment a doctor starts accepting in your area; (2) Expanding your search radius—some people travel 30+ minutes to see their family doctor; (3) Checking back regularly as status changes happen frequently; (4) Asking about waitlists when you call clinics; (5) Registering with provincial or regional programmes while you continue searching.",
      },
    ],
  },
  {
    title: "Alert Service",
    faqs: [
      {
        question: "How does the Alert Service work?",
        answer: "When you subscribe to Alert Service ($7.99 CAD per month), you can monitor up to 3 Ontario cities or postal code areas. Whenever a clinic in those locations changes their status to \"accepting patients\" and matches your optional filter preferences (language, accessibility features), we send you an email alert with their information within minutes. This gives you a time advantage to call before their roster fills.",
      },
      {
        question: "What information is included in alert emails?",
        answer: "Each alert includes: the clinic name and full address, phone number to call, distance from the city centre you're monitoring, when the status was updated, and whether it was verified by the clinic or community. You'll have everything you need to call immediately.",
      },
      {
        question: "Can I monitor multiple cities?",
        answer: "Yes, Alert Service allows you to monitor up to 3 different cities or postal code areas simultaneously. Many subscribers use this to help family members in different cities—for example, monitoring Toronto for yourself, Ottawa for aging parents, and Hamilton for a sibling.",
      },
      {
        question: "Can I change my monitored cities?",
        answer: "Yes. You can update your monitored cities anytime through your account dashboard. Changes take effect immediately, so you'll start receiving alerts for your new locations right away.",
      },
      {
        question: "How many alerts will I receive?",
        answer: "This varies based on how many clinics are accepting patients in your monitored cities. Some weeks you might receive several alerts; other weeks, none. We only email when there's an actual opportunity—a clinic matching your criteria that has changed their status to accepting. You won't receive spam or unnecessary emails.",
      },
      {
        question: "Can I use alerts for multiple family members?",
        answer: "Absolutely. Many subscribers use their 3 city slots to help parents, children, or other family members in different cities find doctors. This is a common and encouraged use of the service.",
      },
      {
        question: "How are email alerts different from free search?",
        answer: "Free search lets you browse clinics whenever you want, requiring you to check manually. Email alerts actively monitor clinics in your chosen cities 24/7 and notify you the moment one starts accepting patients. This means you can be among the first to call, significantly improving your chances of securing a spot before the roster fills.",
      },
      {
        question: "Can I filter alerts by language or accessibility?",
        answer: "Yes! Alert Service subscribers can set optional filters for languages (up to 10 languages) and accessibility features (wheelchair accessible, accessible parking). Only clinics matching your preferences will trigger alerts, saving you time and ensuring you only receive relevant notifications.",
      },
      {
        question: "How quickly do alerts go out?",
        answer: "Email alerts are sent within minutes of a status change. Our system monitors for changes continuously and delivers notifications as soon as a doctor matching your criteria becomes available. This speed gives you a crucial time advantage.",
      },
    ],
  },
  {
    title: "Payment & Billing",
    faqs: [
      {
        question: "How much does Alert Service cost?",
        answer: "Alert Service costs $7.99 CAD per month. This price includes monitoring up to 3 cities, unlimited alerts, optional language and accessibility filters, and the ability to change your monitored locations anytime. Pricing is subject to applicable taxes.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. Payment is processed securely through Stripe, our PCI DSS-compliant payment processor. Your payment information is never stored on our servers.",
      },
      {
        question: "Will my subscription auto-renew?",
        answer: "Yes, subscriptions automatically renew monthly on the same date you subscribed unless you cancel. You'll be charged the current subscription rate at each renewal. We'll provide at least 30 days' advance notice if we ever need to change pricing.",
      },
      {
        question: "Can I cancel anytime?",
        answer: "Absolutely. You can cancel your subscription at any time from your account dashboard or through the Stripe customer portal. There are no cancellation fees, no questions asked. You'll continue to have access to Alert Service until the end of your current billing period.",
      },
      {
        question: "Can I get a refund?",
        answer: "Refunds are available within the first 7 days of your initial subscription, provided you haven't received any doctor alert emails during that time. Once you receive your first alert, the service has been delivered and refunds are not available for that billing period. You can always cancel anytime to avoid future charges. For billing errors or unauthorised charges, please contact support@findyourdoctor.ca.",
      },
      {
        question: "Do you offer annual billing?",
        answer: "Currently we only offer monthly billing at $7.99 CAD per month. This gives you the flexibility to cancel as soon as you find a doctor, without being locked into a longer commitment.",
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes. We never store your complete payment card information on our servers. All payment information is securely processed and stored by Stripe, which is PCI DSS Level 1 certified (the highest level of payment security certification). Your financial data is protected by bank-level encryption.",
      },
    ],
  },
  {
    title: "Assisted Access Programme",
    faqs: [
      {
        question: "What is Assisted Access?",
        answer: "Assisted Access is our programme that provides free access to the Alert Service for individuals facing financial barriers. We believe that cost should never prevent someone from accessing tools to find healthcare. The programme is funded by our paid Alert Service subscribers and provides identical features for 6-month renewable terms.",
      },
      {
        question: "Who qualifies for Assisted Access?",
        answer: "Assisted Access is available to anyone for whom the $7.99 CAD monthly subscription represents a genuine financial barrier. We operate on an honour system based on self-assessment. We don't set specific income criteria, and we don't require proof of income or documentation. We trust you to assess your own situation honestly.",
      },
      {
        question: "How long does Assisted Access last?",
        answer: "Assisted Access is granted for 6-month terms. At the end of your term, you'll receive an email with a link to renew with a single click if you still need support. If your financial situation improves during the 6 months, we kindly ask that you consider upgrading to the paid Alert Service, as paid subscribers make it possible for us to offer Assisted Access to others who need it.",
      },
      {
        question: "Is there a limit to how many times I can renew?",
        answer: "No. You can renew every 6 months as long as you need support. We're here to help, not to judge. There's no maximum number of renewals.",
      },
      {
        question: "How do I apply for Assisted Access?",
        answer: "Visit our Assisted Access page and fill out the brief application form. You'll need to provide your email address, the city you want to monitor, and a brief note about your situation (minimum 20 characters). Applications are approved instantly, and you'll receive access immediately after completing the form.",
      },
      {
        question: "Do I need to provide proof of income or documentation?",
        answer: "No. Assisted Access is based entirely on self-assessment. We don't ask for proof of income, financial documents, or verification of circumstances. We trust applicants to honestly assess their need for assistance.",
      },
      {
        question: "Is Assisted Access really the same as paid Alert Service?",
        answer: "Yes. Assisted Access users receive the exact same Alert Service features as paid subscribers: up to 3 monitored cities, instant email notifications, optional language and accessibility filters, and the ability to change cities anytime. There is no reduced functionality or degraded service level.",
      },
      {
        question: "Will anyone know I'm using Assisted Access?",
        answer: "Your Assisted Access status is shown only in your private account dashboard and is visible only to you. No one else can see it unless you choose to share that information. You receive the same alert emails and features as paid subscribers, and there's no visible difference in service.",
      },
      {
        question: "Do I need to reapply after 6 months?",
        answer: "No. At the end of 6 months, you'll receive an email with a simple renewal link. One click and you're set for another 6 months if you still need support. The renewal process is quick and respectful of your time.",
      },
      {
        question: "What if my situation changes during the 6 months?",
        answer: "If your financial situation improves during your Assisted Access term, you can upgrade to a paid Alert Service subscription anytime from your dashboard. However, there's no obligation to upgrade. We trust you to make the right choice for your circumstances.",
      },
      {
        question: "Can I add more cities after I'm approved?",
        answer: "Yes. Once approved for Assisted Access, you can monitor up to 3 Ontario cities total through your dashboard, just like paid Alert Service subscribers.",
      },
      {
        question: "Is Assisted Access really free? What's the catch?",
        answer: "Yes, it's completely free with no hidden catches, fees, or obligations. We created this programme because we believe everyone deserves access to healthcare resources regardless of financial situation. The only 'catch' is that we genuinely hope you'll consider upgrading to paid service if your circumstances improve, as this helps sustain the programme for others.",
      },
    ],
  },
  {
    title: "Privacy & Security",
    faqs: [
      {
        question: "Is my personal information secure?",
        answer: "Yes. We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL) and at rest, secure password hashing, access controls, and regular security audits. We are committed to compliance with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and handle all personal information with the highest privacy standards.",
      },
      {
        question: "What data do you collect?",
        answer: "For free users submitting status updates, we collect only the update information and IP address (for fraud prevention). For Alert Service subscribers, we collect your email address, password (securely hashed), alert preferences (cities, radius, filters), and Stripe customer ID for payment processing. For Assisted Access applicants, we also collect your reason for applying and city. We do not track your browsing across other websites or use advertising cookies.",
      },
      {
        question: "Do you sell my data?",
        answer: "No. We will never sell, rent, trade, or otherwise monetise your personal information. We do not sell your data to third parties for marketing purposes or provide it to third parties for their independent use. Your privacy is not a commodity to us. This is a fundamental commitment.",
      },
      {
        question: "What do you do with my data?",
        answer: "We use your personal information only for: (1) Providing the Service you requested (alerts, search, account management); (2) Processing payments; (3) Preventing fraud and abuse; (4) Improving the platform; (5) Complying with legal obligations; (6) Communicating with you about your account. We collect only what's necessary and retain it only as long as needed. See our Privacy Policy for complete details.",
      },
      {
        question: "Who do you share my information with?",
        answer: "We share personal information only with: (1) Service providers who help deliver our Service (Stripe for payments, Resend for emails, Google Maps for location services, Supabase for data storage)—all bound by written agreements requiring data protection; (2) Canadian law enforcement when legally required; (3) Successor entities in the event of a business transfer (with notice). We do not share information with advertisers or data brokers.",
      },
      {
        question: "Can I delete my account and data?",
        answer: "Yes. You can request account deletion at any time by contacting us at support@findyourdoctor.ca. If you have an Alert Service subscription, you must cancel it first. We will permanently delete your personal information within 30 days, subject to legal retention requirements (such as payment records kept for 7 years for tax compliance). Community Reports you submitted may remain anonymised for public benefit.",
      },
      {
        question: "How can I access my personal information?",
        answer: "Under PIPEDA, you have the right to access your personal information. Contact our Privacy Officer at privacy@findyourdoctor.ca to request a copy of your data. We will respond within 30 days and provide the information in a commonly used format. You also have the right to request corrections to inaccurate information.",
      },
      {
        question: "What if I have a privacy complaint?",
        answer: "First, contact our Privacy Officer at privacy@findyourdoctor.ca and we'll work to resolve your concern. If you're not satisfied with our response, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada at 1-800-282-1376 or www.priv.gc.ca. See our Privacy Policy for complete details on your rights.",
      },
    ],
  },
  {
    title: "Medical & Safety Information",
    faqs: [
      {
        question: "Is FindYourDoctor.ca a medical service?",
        answer: "No. FindYourDoctor.ca is an informational service only. We are not a healthcare provider, medical professional, or medical advice service. We do not provide clinical services, establish patient-provider relationships, or offer medical advice, diagnosis, or treatment. Our service helps you locate family doctors; it does not replace appropriate medical care.",
      },
      {
        question: "What should I do in a medical emergency?",
        answer: "FindYourDoctor.ca is for finding a family doctor for ongoing care, not for emergencies. For immediate medical needs: (1) Call 9-1-1 for emergencies; (2) Visit your nearest emergency department for urgent care; (3) Call Telehealth Ontario at 1-866-797-0000 for health advice; (4) Visit a walk-in clinic for non-emergency urgent needs. Do not use our service to seek emergency medical assistance.",
      },
      {
        question: "Should I verify doctor credentials?",
        answer: "Yes. You are solely responsible for verifying the credentials, qualifications, registration status, and suitability of any healthcare provider you contact through our Service. We recommend checking provider registration with the College of Physicians and Surgeons of Ontario (CPSO) public register before establishing a patient-provider relationship. Visit cpso.on.ca to verify credentials.",
      },
      {
        question: "Do you guarantee I'll find a doctor?",
        answer: "No. While we strive to provide helpful, current information, we cannot guarantee that you will successfully obtain a family doctor through use of the Service. Doctor acceptance status can change at any time, and many factors affect whether you can register with a particular doctor. We provide tools to improve your search, but outcomes depend on many factors outside our control.",
      },
    ],
  },
  {
    title: "Technical & Account Support",
    faqs: [
      {
        question: "I'm not receiving alert emails. What should I do?",
        answer: "First, check your spam/junk folder. Add alerts@findyourdoctor.ca to your contacts to ensure future emails reach your inbox. Verify your email address is correct in your account settings. Check that your monitored cities are set up properly. If problems persist, contact support@findyourdoctor.ca and we'll investigate.",
      },
      {
        question: "How do I change my email address?",
        answer: "Currently, email addresses cannot be changed directly. Please contact support@findyourdoctor.ca with your request and we'll assist you. In the future, we plan to add self-service email updates in your account dashboard.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "On the sign-in page, click \"Forgot Password\" and enter your email address. We'll send you a password reset link. If you don't receive it within a few minutes, check your spam folder. If problems persist, contact support@findyourdoctor.ca.",
      },
      {
        question: "How do I update my payment method?",
        answer: "Log in to your account, click \"Manage Billing\" in your dashboard, and you'll be redirected to the Stripe customer portal where you can securely update your payment method. You can also update payment information through the link in your billing receipt emails.",
      },
      {
        question: "Can I pause my subscription temporarily?",
        answer: "We don't currently offer subscription pausing. However, you can cancel anytime and resubscribe later when you're ready to resume monitoring. Your alert preferences will be saved, making it easy to pick up where you left off.",
      },
      {
        question: "Who should I contact for support?",
        answer: "For general support: support@findyourdoctor.ca. For privacy concerns: privacy@findyourdoctor.ca. For accessibility issues: accessibility@findyourdoctor.ca. For legal questions: legal@findyourdoctor.ca. We typically respond within 1-2 business days.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about FindYourDoctor.ca, organized by topic
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="bg-background-alt py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4 text-center">Jump to section:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {faqCategories.map((category) => (
                <a
                  key={category.title}
                  href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm px-3 py-1 bg-card border border-border rounded-md hover:bg-secondary/10 hover:border-secondary transition-colors"
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-16">
            {faqCategories.map((category) => (
              <div 
                key={category.title} 
                id={category.title.toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-24"
              >
                <h2 className="text-2xl text-primary mb-6 pb-2 border-b border-border">
                  {category.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {category.faqs.length} {category.faqs.length === 1 ? 'question' : 'questions'}
                </p>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.title}-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Help Section */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl text-primary mb-4">
              Didn't find what you're looking for?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help answer any questions not covered in this FAQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/how-it-works">Learn How It Works</Link>
              </Button>
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
                Ready to start searching?
              </h2>
              <p className="text-muted-foreground mb-6">
                Use our free search to find family doctors accepting patients near you.
              </p>
              <Button asChild size="lg">
                <Link to="/clinics">Start Searching for Free</Link>
              </Button>
            </div>
            {/* Image at bottom, flush with no bottom padding */}
            <div className="flex justify-end flex-shrink-0">
              <img 
                src={coupleFooterImage} 
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
