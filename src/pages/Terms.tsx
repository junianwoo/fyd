export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8 text-foreground">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using FindYourDoctor.ca, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Service Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  FindYourDoctor.ca provides a searchable directory of family doctors in Ontario with 
                  accepting status information. We offer a free search service and a paid Alert Service 
                  for email notifications.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Medical Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  FindYourDoctor.ca is an informational service only. We are not a medical provider, 
                  and our service does not constitute medical advice. For medical emergencies, call 911. 
                  We are not affiliated with any government agency, health authority, or the College of 
                  Physicians and Surgeons of Ontario (CPSO).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Data Accuracy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Doctor status information is provided by community members and verified doctors. 
                  While we strive for accuracy, we cannot guarantee that all information is current 
                  or correct. Always confirm directly with a doctor's office before making healthcare decisions.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When using our service, you agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Submit false or misleading status updates</li>
                  <li>Use automated tools to scrape or access our data</li>
                  <li>Attempt to interfere with or disrupt our service</li>
                  <li>Use the service for any unlawful purpose</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Alert Service Subscription</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The Alert Service is billed monthly at $7.99 CAD. You may cancel at any time through 
                  your dashboard. Refunds are not provided for partial months. We reserve the right to 
                  modify pricing with 30 days notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the maximum extent permitted by law, FindYourDoctor.ca shall not be liable for 
                  any indirect, incidental, special, or consequential damages arising from your use 
                  of the service or reliance on information provided.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these Terms of Service from time to time. Continued use of the service 
                  after changes constitutes acceptance of the new terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary mb-4">Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about these Terms? Contact us at{" "}
                  <a href="mailto:support@findyourdoctor.ca" className="text-secondary hover:text-primary">
                    support@findyourdoctor.ca
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
