export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 1, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-slate">
            <div className="space-y-8 text-foreground">
              <div>
                <h2 className="text-2xl text-primary mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  FindYourDoctor.ca ("we," "our," or "us") respects your privacy and is committed to 
                  protecting your personal information. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you visit our website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect information in the following ways:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Account Information:</strong> When you create an account, we collect your email address and password.</li>
                  <li><strong>Alert Preferences:</strong> If you subscribe to alerts, we store your location preferences.</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe; we don't store card details.</li>
                  <li><strong>Usage Data:</strong> We collect anonymized analytics to improve our service.</li>
                  <li><strong>Community Reports:</strong> Status updates submitted are associated with IP addresses for fraud prevention.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>To provide and maintain our service</li>
                  <li>To send email alerts when doctors update their accepting status</li>
                  <li>To process payments for the Alert Service</li>
                  <li>To communicate with you about your account</li>
                  <li>To improve our website and services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share data with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                  <li><strong>Service Providers:</strong> Stripe for payments, SendGrid for emails</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your data, including 
                  encryption in transit and at rest, secure authentication, and regular security audits.
                </p>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal information. 
                  You can manage your account settings or contact us to exercise these rights.
                </p>
              </div>

              <div>
                <h2 className="text-2xl text-primary mb-4">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
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
