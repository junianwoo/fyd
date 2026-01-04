import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "About the Service",
    faqs: [
      {
        question: "What is FindYourDoctor.ca?",
        answer: "FindYourDoctor.ca is a searchable directory of family doctors in Ontario that shows real-time accepting status. We help Ontarians find family doctors accepting new patients through community-powered updates and optional email alerts.",
      },
      {
        question: "Is FindYourDoctor.ca affiliated with the government?",
        answer: "No, we are not affiliated with or endorsed by any government agency, health authority, or the College of Physicians and Surgeons of Ontario (CPSO). We are an independent service created to help Ontarians find family doctors more easily.",
      },
      {
        question: "How accurate is the doctor status information?",
        answer: "Our data comes from two sources: verified updates from doctors who claim their listings, and community reports from patients who've recently contacted clinics. We display when each listing was last updated and who verified it.",
      },
    ],
  },
  {
    title: "Free Search",
    faqs: [
      {
        question: "Is it really free to search?",
        answer: "Yes! Searching for doctors, viewing their accepting status, and seeing contact information is completely free. No signup required. We believe everyone should have access to this basic information.",
      },
      {
        question: "Do I need to create an account to search?",
        answer: "No, you can search and view all doctor listings without creating an account. An account is only needed if you want to subscribe to the Alert Service for email notifications.",
      },
      {
        question: "Can I update a doctor's status without an account?",
        answer: "Yes! We encourage everyone to help keep listings accurate. You can submit a status update for any doctor without logging in. Your update helps someone else find care faster.",
      },
    ],
  },
  {
    title: "Alert Service",
    faqs: [
      {
        question: "How does the Alert Service work?",
        answer: "Once subscribed ($7.99/month), you can set up to 3 locations to monitor. Whenever a doctor in your selected areas updates their status to 'accepting patients', you'll receive an email notification immediately so you can be one of the first to call.",
      },
      {
        question: "Can I monitor multiple cities?",
        answer: "Yes, the Alert Service allows you to monitor up to 3 different cities or postal code areas simultaneously. You can change your monitored locations anytime from your dashboard.",
      },
      {
        question: "Can I cancel anytime?",
        answer: "Absolutely. You can cancel your subscription at any time from your dashboard. You'll continue to have access until the end of your current billing period. No questions asked, no cancellation fees.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor. Your payment information is never stored on our servers.",
      },
    ],
  },
  {
    title: "Privacy & Security",
    faqs: [
      {
        question: "Is my information secure?",
        answer: "Yes, we use industry-standard encryption to protect your data. We never sell or share your personal information with third parties. Your email is only used for alerts and important service updates.",
      },
      {
        question: "What data do you collect?",
        answer: "For free users submitting status updates, we only collect the update information. For Alert Service subscribers, we collect your email, password, and alert preferences. We don't track your browsing or sell your data.",
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
            Everything you need to know about FindYourDoctor.ca
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl text-primary mb-6">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.title}-${index}`}
                      className="bg-card border border-border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
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

      {/* Contact CTA */}
      <section className="bg-background-alt py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl text-primary mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            We're here to help. Reach out to our support team.
          </p>
          <Button asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
