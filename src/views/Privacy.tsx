export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-2">
            Last updated: January 10, 2026
          </p>
          <p className="text-muted-foreground">
            Effective date: January 10, 2026
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
                <h2 className="text-2xl text-primary mb-4">1. Introduction and Scope</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca ("we," "our," "us," or the "Service") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, retain, and protect personal information obtained through our Service, which provides a community-driven resource to help residents of Ontario, Canada, locate family practice clinics accepting new patients.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our mission is to support Ontarians in their search for healthcare access during a significant healthcare crisis affecting approximately 2.5 million residents who lack primary care physicians. We recognise the sensitivity of healthcare-related information and are committed to handling all personal information with the highest standards of privacy protection.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy applies to all users of FindYourDoctor.ca, including visitors browsing the clinic directory, registered users, Alert Service subscribers, Assisted Access programme participants, and clinic staff who claim their listings. By using our Service, you acknowledge that you have read, understood, and agree to the practices described in this Privacy Policy.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">2. PIPEDA Compliance Statement</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca is committed to full compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA), Canada's federal privacy law governing the collection, use, and disclosure of personal information by private sector organisations.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We adhere to the ten fair information principles set forth in PIPEDA:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Accountability:</strong> We have designated a Privacy Officer responsible for our compliance with this Privacy Policy and PIPEDA.</li>
                  <li><strong>Identifying Purposes:</strong> We identify the purposes for which personal information is collected at or before the time of collection.</li>
                  <li><strong>Consent:</strong> We obtain your informed consent for the collection, use, and disclosure of your personal information.</li>
                  <li><strong>Limiting Collection:</strong> We collect only the personal information necessary for the identified purposes.</li>
                  <li><strong>Limiting Use, Disclosure, and Retention:</strong> We use and disclose personal information only for the purposes for which it was collected, and retain it only as long as necessary.</li>
                  <li><strong>Accuracy:</strong> We maintain personal information that is accurate, complete, and up to date.</li>
                  <li><strong>Safeguards:</strong> We protect personal information with security safeguards appropriate to its sensitivity.</li>
                  <li><strong>Openness:</strong> We make information about our privacy policies and practices readily available.</li>
                  <li><strong>Individual Access:</strong> We provide you with access to your personal information upon request.</li>
                  <li><strong>Challenging Compliance:</strong> We provide mechanisms for you to challenge our compliance with these principles.</li>
                </ol>
                <p className="text-muted-foreground leading-relaxed">
                  This Privacy Policy is designed to demonstrate our commitment to these principles and provide transparency about our privacy practices.
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">3. Definitions</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For the purposes of this Privacy Policy, the following definitions apply:
                </p>
                <ul className="list-none space-y-3 text-muted-foreground">
                  <li><strong>"Personal Information"</strong> means information about an identifiable individual, as defined under PIPEDA, including but not limited to name, email address, IP address, and any information that can be used alone or in combination with other information to identify an individual.</li>
                  <li><strong>"Sensitive Personal Information"</strong> means Personal Information that requires a heightened level of protection due to its nature, including health information, financial information, and information about individuals' economic circumstances (such as Assisted Access applications).</li>
                  <li><strong>"Service"</strong> means the FindYourDoctor.ca website, platform, applications, and all related services, features, and functionality.</li>
                  <li><strong>"User" or "you"</strong> means any individual or entity accessing or using the Service.</li>
                  <li><strong>"Account"</strong> means a registered user account created to access certain Service features.</li>
                  <li><strong>"Processing"</strong> means any operation performed on Personal Information, including collection, use, disclosure, retention, and disposal.</li>
                  <li><strong>"Third-Party Service Providers"</strong> means organisations that provide services on our behalf, such as payment processing, email delivery, and data storage.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">4. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect various types of Personal Information to provide and improve our Service. Below is a comprehensive description of the information we collect, the purposes for collection, and the legal basis for processing:
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Account Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you create an Account, we collect your email address and create a securely hashed password. We also record your account creation date and last login information.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To create and maintain your Account, authenticate your identity, enable access to premium features, and communicate with you about your Account.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Alert Service Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  If you subscribe to the Alert Service, we collect and store the Ontario cities you wish to monitor, your specified search radius (in kilometres), language preferences, and accessibility feature requirements.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To deliver personalised alert notifications matching your specified criteria and location preferences.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Assisted Access Application Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you apply for Assisted Access, we collect your email address, the city you wish to monitor, a brief written explanation of your circumstances, and your confirmation that the subscription fee represents a financial barrier. We also record your application submission date, approval status, programme expiry date, and renewal history.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To administer the Assisted Access programme, grant appropriate access, manage renewals, and improve programme effectiveness. This information is handled with heightened confidentiality as it relates to individuals' economic circumstances.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Community Report Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you submit a Community Report about a clinic's patient acceptance status, we collect the status information you provide, any additional notes, the date and time of submission, and your IP address.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To maintain current clinic information for community benefit and to prevent fraudulent or abusive reporting. IP address collection is necessary for security purposes and fraud prevention, consistent with PIPEDA's security safeguards principle.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Doctor Claiming Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When healthcare providers claim their listings, we collect their email address, verification tokens (temporary codes sent via email), claim submission timestamps, and verification completion dates.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To verify provider identity, prevent unauthorised claims, and enable providers to maintain accurate practice information.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Payment Information</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  For Alert Service subscribers, we store Stripe customer identifiers that link to your payment methods. We do not store complete payment card numbers, CVV codes, or other sensitive payment details on our servers. All payment information is securely stored by Stripe, our PCI DSS-compliant payment processor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To process subscription payments, manage billing, and facilitate refunds when applicable.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Search and Usage Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We collect information about how you use the Service, including search queries (cities, postal codes), filters applied (languages, accessibility features), pages visited, features used, clicks, and interactions. We also collect device information such as device type, operating system, and browser type.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To improve Service functionality, understand user needs, identify technical issues, and enhance user experience. This data helps us make the Service more effective for all users.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Location Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you search for doctors by city or postal code, or when you configure Alert Service monitoring, we use the Google Maps API to geocode your location queries into geographic coordinates (latitude and longitude).
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To provide location-based search functionality and calculate distances between your location and doctors' practices for service delivery.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Communications</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  When you contact us via email or through our support channels, we collect the contents of your communications, your email address, and the date and nature of your inquiry.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To respond to your inquiries, provide customer support, resolve issues, and improve our Service based on user feedback.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Technical Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We automatically collect certain technical information when you access the Service, including IP addresses, browser type and version, time zone settings, browser plug-in types and versions, operating system and platform, and other technology on devices used to access the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Purpose:</strong> To ensure Service functionality, maintain security, diagnose technical problems, and analyse Service performance. We collect only the minimal technical data necessary for these purposes.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Analytics</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We collect aggregated, anonymised usage patterns and statistics that do not identify individual users. This includes metrics such as total searches performed, popular search locations, most-viewed doctor listings, and feature usage rates.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Purpose:</strong> To understand aggregate usage trends, measure Service effectiveness, and make data-driven improvements that benefit all users. No personal identification is possible from this aggregated data.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">5. How We Collect Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We collect Personal Information through the following methods:
                </p>
                <h3 className="text-xl text-foreground mb-3">Direct Input with Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Most Personal Information is collected directly from you when you voluntarily provide it, such as when creating an Account, subscribing to the Alert Service, applying for Assisted Access, submitting Community Reports, or contacting us for support. We obtain your consent at or before the time of collection by clearly explaining the purposes for which information is being collected.
                </p>
                <h3 className="text-xl text-foreground mb-3">Automated Technologies with Notice</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We automatically collect certain technical information through cookies and similar technologies when you visit the Service. We provide notice of this collection through this Privacy Policy and, where required, obtain consent for non-essential cookies.
                </p>
                <h3 className="text-xl text-foreground mb-3">Limited Third-Party Sources</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In limited circumstances, we receive information from third-party service providers who assist in delivering the Service (such as payment confirmation from Stripe or geocoding data from Google Maps). These third parties are contractually obligated to handle information in accordance with applicable privacy laws.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">6. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on the Service. Our use of these technologies is minimal and focused on essential functionality.
                </p>
                <h3 className="text-xl text-foreground mb-3">Types of Cookies We Use</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Essential Cookies:</strong> Necessary for basic Service functionality, including authentication, session management, and security features. These cookies are required for the Service to work properly.</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings to provide enhanced functionality and personalisation.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service through aggregated, anonymised data collection.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>What We Do NOT Use:</strong> We do not use advertising cookies, tracking cookies for marketing purposes, or third-party cookies that track you across other websites. We do not sell data collected through cookies to any third party.
                </p>
                <h3 className="text-xl text-foreground mb-3">Managing Cookies</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or alert you when cookies are being sent. However, if you disable essential cookies, some features of the Service may not function properly.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">7. Purposes and Legal Bases for Processing</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We process your Personal Information only for identified purposes and in accordance with PIPEDA's fair information principles. Each processing activity is tied to a specific purpose:
                </p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
                  <li><strong>Provide and Maintain Service:</strong> To deliver the doctor directory, search functionality, mapping features, and all core Service features (implied consent based on use of Service).</li>
                  <li><strong>Process Payments and Subscriptions:</strong> To charge subscription fees, manage billing, process refunds, and maintain payment records (express consent obtained at subscription).</li>
                  <li><strong>Send Alert Emails:</strong> To deliver doctor acceptance notifications to Alert Service subscribers based on their specified criteria (express consent obtained in compliance with CASL).</li>
                  <li><strong>Verify Healthcare Provider Claims:</strong> To authenticate provider identity and enable direct practice information management (legitimate purpose of service integrity).</li>
                  <li><strong>Prevent Fraud and Abuse:</strong> To detect, prevent, and respond to fraudulent activity, security incidents, and abuse of the Service (security safeguards principle under PIPEDA).</li>
                  <li><strong>Improve Platform:</strong> To analyse usage patterns, identify areas for improvement, develop new features, and enhance user experience (implied consent, legitimate interest in service improvement).</li>
                  <li><strong>Comply with Canadian Legal Obligations:</strong> To meet legal and regulatory requirements, respond to lawful requests from authorities, and protect legal rights (legal obligation).</li>
                  <li><strong>Service Communications:</strong> To send transactional emails, account notifications, service updates, and respond to support inquiries (implied consent for transactional communications, express consent for marketing where applicable).</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">8. Consent and Withdrawal</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Consent is fundamental to our privacy practices. We obtain your consent for the collection, use, and disclosure of Personal Information, and respect your right to withdraw consent.
                </p>
                <h3 className="text-xl text-foreground mb-3">How We Obtain Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Express Consent:</strong> For sensitive uses of Personal Information (such as processing Assisted Access applications or sending Alert Service notifications), we obtain your express consent through opt-in mechanisms, checkboxes, or explicit agreement to terms.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Implied Consent:</strong> For non-sensitive uses reasonably expected in the context of Service delivery (such as using your search query to display results), we rely on implied consent based on your voluntary use of the Service.
                </p>
                <h3 className="text-xl text-foreground mb-3">Withdrawing Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may withdraw your consent at any time, subject to legal or contractual restrictions and reasonable notice. To withdraw consent:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>For Alert Service: Cancel your subscription through your Account dashboard</li>
                  <li>For marketing emails: Use the unsubscribe link in any email or contact us</li>
                  <li>For Account and all associated data: Request Account deletion through our Privacy Officer</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Consequences of Withdrawal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Withdrawing consent for certain processing may limit or prevent us from providing specific Service features. For example, cancelling the Alert Service means you will no longer receive notifications, and deleting your Account means you will lose access to all Account-based features. We will inform you of any such consequences before you withdraw consent.
                </p>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">9. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We engage in limited sharing of Personal Information only as necessary to provide the Service and in accordance with this Privacy Policy. We do not sell your Personal Information to third parties for their marketing purposes.
                </p>
                <h3 className="text-xl text-foreground mb-3">Service Providers</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We share Personal Information with third-party service providers who perform services on our behalf under contractual obligations that require them to keep your information confidential and use it only for purposes we specify:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Stripe (Payment Processing):</strong> Processes subscription payments securely; receives billing information necessary to complete transactions</li>
                  <li><strong>Resend (Email Delivery):</strong> Delivers alert notifications and account communications; receives email addresses and message content</li>
                  <li><strong>Google Maps (Geocoding and Mapping):</strong> Converts location queries to coordinates; receives search locations</li>
                  <li><strong>Supabase (Data Storage and Infrastructure):</strong> Provides secure data storage and backend services; stores all Service data</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All service providers are bound by written agreements requiring them to implement appropriate safeguards and use Personal Information only for specified purposes.
                </p>
                <h3 className="text-xl text-foreground mb-3">Legal Requirements</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may disclose Personal Information to Canadian law enforcement, government agencies, courts, or other third parties when required by law, including in response to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Court orders, subpoenas, or other legal processes</li>
                  <li>Legal or regulatory requirements</li>
                  <li>Legitimate requests from government authorities</li>
                  <li>Protection of our legal rights or the safety of users</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Business Transfers</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In the event of a merger, acquisition, reorganisation, bankruptcy, or sale of assets, Personal Information may be transferred to successor entities. We will provide notice of such transfers and, where required by law, obtain consent before Personal Information becomes subject to different privacy practices.
                </p>
                <h3 className="text-xl text-foreground mb-3">Aggregated Data</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share aggregated, non-identifiable statistics about Service usage, search patterns, and trends for analysis, reporting, and improvement purposes. This aggregated data cannot be used to identify individual users.
                </p>
                <h3 className="text-xl text-foreground mb-3">With Your Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may share Personal Information for purposes not described in this Privacy Policy when we have obtained your explicit consent to do so.
                </p>
                <h3 className="text-xl text-foreground mb-3">Commitment: No Selling of Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We will never sell, rent, trade, or otherwise monetise your Personal Information for marketing purposes or provide it to third parties for their independent use. Your privacy is not a commodity to us.
                </p>
              </div>

              {/* Section 10 - Continue in next message due to length */}
              <div>
                <h2 className="text-2xl text-primary mb-4">10. Third-Party Service Providers</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We carefully select third-party service providers and ensure they maintain adequate privacy protections. Below are details about our primary service providers and their roles:
                </p>
                <h3 className="text-xl text-foreground mb-3">Stripe (Payment Processing)</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Stripe processes all payment transactions for Alert Service subscriptions. Stripe is PCI DSS Level 1 certified, the highest level of payment security certification. Stripe stores payment card information securely and processes payments in compliance with Canadian payment regulations. For more information, see Stripe's Privacy Policy at stripe.com/privacy.
                </p>
                <h3 className="text-xl text-foreground mb-3">Google Maps API (Location Services)</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use Google Maps API to provide mapping, geocoding, and location-based search functionality. When you use map features or search by location, Google may receive your search queries and location data. We implement data minimisation practices to limit information shared with Google. See Google's Privacy Policy for more information.
                </p>
                <h3 className="text-xl text-foreground mb-3">Resend (Email Delivery)</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Resend delivers our alert notifications and transactional emails in compliance with Canada's Anti-Spam Legislation (CASL). Resend receives email addresses and message content necessary for delivery but does not use this information for any other purpose.
                </p>
                <h3 className="text-xl text-foreground mb-3">reCAPTCHA (Spam Prevention)</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use Google reCAPTCHA to prevent spam and abuse in our Assisted Access application form and other user-input areas. reCAPTCHA may collect limited technical information about your browser and interaction patterns. This data sharing is necessary for security purposes.
                </p>
                <h3 className="text-xl text-foreground mb-3">Supabase (Data Storage and Infrastructure)</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Supabase provides our backend infrastructure, database, and authentication services. All Service data, including Personal Information, is stored on Supabase's secure servers with encryption at rest and in transit. Supabase implements enterprise-grade security measures and complies with applicable data protection standards.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Vetting Process:</strong> All third-party service providers are vetted to ensure they maintain adequate privacy protections, have appropriate technical and organisational security measures in place, and comply with applicable laws. We enter into written agreements with service providers that require them to protect Personal Information and use it only for specified purposes.
                </p>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">11. Data Security Safeguards</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement security safeguards appropriate to the sensitivity of Personal Information we collect and process, in accordance with PIPEDA's safeguards principle. Our security measures include:
                </p>
                <h3 className="text-xl text-foreground mb-3">Technical Safeguards</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Encryption of data in transit using TLS/SSL protocols</li>
                  <li>Encryption of sensitive data at rest in our databases</li>
                  <li>Secure password hashing using industry-standard algorithms</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Firewall protection and network security measures</li>
                  <li>Automated backup systems with encryption</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Administrative Safeguards</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Access controls limiting Personal Information access to authorised personnel only</li>
                  <li>Employee training on privacy and security practices</li>
                  <li>Privacy Officer oversight of compliance practices</li>
                  <li>Incident response procedures for security breaches</li>
                  <li>Regular review and updating of security measures</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Physical Safeguards</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our third-party hosting providers implement physical security measures including secure data centres, restricted physical access, environmental controls, and redundant infrastructure.
                </p>
                <h3 className="text-xl text-foreground mb-3">Limitations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  While we implement robust security measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but commit to maintaining security safeguards appropriate to the risk of harm from unauthorised access, use, or disclosure. We will notify you of any material security breaches as required by PIPEDA.
                </p>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">12. Data Retention and Disposal</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We retain Personal Information only as long as necessary to fulfil the purposes for which it was collected and to meet legal, accounting, or reporting requirements. Below are our retention periods for different types of information:
                </p>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
                  <li><strong>Account Information:</strong> Retained for the duration of your Account plus two (2) years after Account deletion to comply with legal obligations and handle disputes.</li>
                  <li><strong>Alert Service Subscription Data:</strong> Retained for the duration of your subscription plus seven (7) years for financial record-keeping requirements.</li>
                  <li><strong>Payment Records:</strong> Retained for seven (7) years in compliance with Canadian tax and financial reporting requirements.</li>
                  <li><strong>Assisted Access Applications:</strong> Retained for the duration of your participation plus three (3) years for programme administration and improvement.</li>
                  <li><strong>Community Reports:</strong> Retained indefinitely as they serve ongoing public benefit purposes, though personally identifying information (such as IP addresses) is deleted after two (2) years.</li>
                  <li><strong>Communications and Support Records:</strong> Retained for three (3) years to maintain service quality and resolve ongoing matters.</li>
                  <li><strong>Technical and Analytics Data:</strong> Aggregated analytics retained indefinitely; individual technical logs deleted after one (1) year.</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Secure Disposal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When Personal Information is no longer required, we securely dispose of it through methods appropriate to the medium, including secure deletion of electronic records, de-identification, and irreversible anonymisation where retention for statistical purposes is necessary.
                </p>
              </div>

              {/* Section 13 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">13. Your Privacy Rights Under Canadian Law</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under PIPEDA and applicable provincial privacy legislation, you have the following rights regarding your Personal Information:
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Access</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to request access to the Personal Information we hold about you. We will provide access within thirty (30) days of receiving your written request, subject to limited exceptions permitted by law. You may request information about how your Personal Information has been used or disclosed in the previous year.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Correction</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to request correction of inaccurate or incomplete Personal Information. We will amend information as appropriate and notify relevant third parties who received the incorrect information, where required.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Deletion</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may request deletion of your Personal Information (sometimes called the "right to be forgotten"), subject to legal and contractual retention requirements. We will delete Personal Information when it is no longer necessary for identified purposes and no legal obligation requires retention.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Withdraw Consent</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Where processing is based on your consent, you may withdraw consent at any time, subject to legal or contractual restrictions and reasonable notice. We will inform you of the implications of withdrawing consent.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Data Portability</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may request a copy of your Personal Information in a structured, commonly used, machine-readable format for transfer to another service provider where technically feasible.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Object</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may object to certain types of processing, including processing for direct marketing purposes or processing based on legitimate interests.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to File a Complaint</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to file a complaint with the Office of the Privacy Commissioner of Canada if you believe we have violated PIPEDA or mishandled your Personal Information.
                </p>
                <h3 className="text-xl text-foreground mb-3">Right to Challenge Compliance</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may challenge our compliance with this Privacy Policy and PIPEDA. We will investigate all complaints promptly and respond substantively.
                </p>
                <h3 className="text-xl text-foreground mb-3">Exercising Your Rights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To exercise any of these rights, contact our Privacy Officer at privacy@findyourdoctor.ca. We will verify your identity before fulfilling requests to protect your Personal Information from unauthorised access. We do not charge fees for reasonable access requests but may charge for excessive, repetitive, or manifestly unfounded requests.
                </p>
              </div>

              {/* Section 14 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">14. Privacy Officer and Accountability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In accordance with PIPEDA's accountability principle, we have designated a Privacy Officer responsible for ensuring our compliance with this Privacy Policy and applicable privacy laws.
                </p>
                <h3 className="text-xl text-foreground mb-3">Privacy Officer Responsibilities</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Privacy Officer oversees:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Implementation and maintenance of privacy policies and procedures</li>
                  <li>Training staff on privacy obligations</li>
                  <li>Responding to privacy inquiries and complaints</li>
                  <li>Managing data subject access requests</li>
                  <li>Coordinating breach response activities</li>
                  <li>Conducting privacy impact assessments</li>
                  <li>Liaising with the Office of the Privacy Commissioner of Canada</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Complaint Resolution Process</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have a privacy complaint:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Submit your complaint in writing to privacy@findyourdoctor.ca</li>
                  <li>We will acknowledge receipt within five (5) business days</li>
                  <li>We will investigate the matter promptly</li>
                  <li>We will provide a substantive response within thirty (30) days</li>
                  <li>If you are unsatisfied with our response, you may escalate to the Office of the Privacy Commissioner of Canada</li>
                </ol>
                <h3 className="text-xl text-foreground mb-3">Contact Our Privacy Officer</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Email: privacy@findyourdoctor.ca<br />
                  Response time: Within thirty (30) days
                </p>
              </div>

              {/* Section 15 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">15. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Service is intended for individuals who have reached the age of majority in Ontario, which is eighteen (18) years of age. We do not knowingly collect Personal Information from individuals under eighteen (18) years of age without parental or guardian consent.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If we discover that we have collected Personal Information from an individual under eighteen (18) without appropriate parental or guardian consent, we will take steps to delete such information promptly.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you are a parent or guardian and believe your child has provided Personal Information to us without your consent, please contact our Privacy Officer at privacy@findyourdoctor.ca so we can take appropriate action.
                </p>
              </div>

              {/* Section 16 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">16. Data Storage and Residency</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your Personal Information is primarily stored on servers located in jurisdictions with adequate data protection laws. We take steps to ensure that Personal Information transferred outside Canada receives protection comparable to that required under PIPEDA.
                </p>
                <h3 className="text-xl text-foreground mb-3">Storage Locations</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Personal Information may be stored in:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Canada (where available and practical)</li>
                  <li>United States (with appropriate safeguards)</li>
                  <li>Other jurisdictions deemed to have adequate privacy protections</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Cross-Border Transfer Safeguards</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When Personal Information is transferred outside Canada, we implement safeguards including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Contractual protections requiring foreign service providers to provide privacy protection comparable to PIPEDA</li>
                  <li>Selection of service providers in jurisdictions with strong privacy frameworks</li>
                  <li>Technical security measures including encryption</li>
                  <li>Regular compliance monitoring</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Please note that when Personal Information is transferred to foreign jurisdictions, it may be subject to lawful access by courts, law enforcement, and national security authorities in those jurisdictions.
                </p>
              </div>

              {/* Section 17 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">17. Automated Decision Making</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We use automated systems to trigger alert notifications when doctors' acceptance status changes to match subscriber criteria. This automated processing does not involve significant automated decision-making that would materially affect your rights or produce legal effects.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Alert Triggering:</strong> Our alert system automatically compares doctor status changes against subscriber preferences (location, radius, languages, accessibility features) and sends email notifications when matches occur. This is a purely technical matching process that does not involve profiling or decisions affecting your substantive rights.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Assisted Access Approval:</strong> Assisted Access applications are approved automatically based on self-assessment without algorithmic scoring or automated decision-making about individual circumstances. This reflects our trust-based approach and commitment to removing barriers to access.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>No Profiling:</strong> We do not engage in automated profiling, predictive analytics about individuals, or automated decision-making that would significantly affect you without human involvement.
                </p>
              </div>

              {/* Section 18 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">18. Data Breach Notification</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We maintain incident response procedures compliant with PIPEDA's mandatory breach reporting requirements, which came into effect on November 1, 2018.
                </p>
                <h3 className="text-xl text-foreground mb-3">Breach Response Procedures</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In the event of a data breach involving Personal Information:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>We will conduct a thorough investigation to determine the scope and impact</li>
                  <li>We will contain the breach and mitigate harm</li>
                  <li>We will assess whether the breach creates a real risk of significant harm</li>
                  <li>If significant harm risk exists, we will notify the Office of the Privacy Commissioner of Canada as soon as feasible</li>
                  <li>We will notify affected individuals as soon as feasible if significant harm risk exists</li>
                  <li>We will maintain records of all breaches as required by PIPEDA</li>
                </ol>
                <h3 className="text-xl text-foreground mb-3">Notification Content</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Breach notifications to affected individuals will include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Description of the circumstances of the breach</li>
                  <li>Date or time period of the breach</li>
                  <li>Description of Personal Information involved</li>
                  <li>Steps we are taking to reduce risk of harm</li>
                  <li>Steps you can take to reduce risk of harm</li>
                  <li>Contact information for inquiries</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to transparency about security incidents while balancing investigative and remediation needs.
                </p>
              </div>

              {/* Section 19 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">19. Account Deletion and Data Erasure</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You have the right to request deletion of your Account and associated Personal Information at any time, subject to certain limitations.
                </p>
                <h3 className="text-xl text-foreground mb-3">Deletion Process</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To request Account deletion:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>If you have an Alert Service subscription, cancel it first through your Account dashboard or customer portal</li>
                  <li>Contact us at support@findyourdoctor.ca with your deletion request</li>
                  <li>We will verify your identity to prevent unauthorised deletion requests</li>
                  <li>We will process your deletion request within thirty (30) days</li>
                </ol>
                <h3 className="text-xl text-foreground mb-3">What Gets Deleted</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Upon Account deletion, we will permanently delete:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Your Account credentials and login information</li>
                  <li>Alert Service preferences and subscription data</li>
                  <li>Assisted Access application information</li>
                  <li>Email addresses and contact information</li>
                  <li>Personal preferences and settings</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">What May Be Retained</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may retain certain information when required by law or legitimate business purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Payment records (seven years for financial/tax compliance)</li>
                  <li>Community Reports you submitted (anonymised and retained for public benefit)</li>
                  <li>Records necessary to resolve disputes or enforce agreements</li>
                  <li>Records required to comply with legal obligations</li>
                  <li>Aggregated, anonymised data that cannot identify you</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Retained records will be maintained securely and for no longer than necessary for the specified purpose.
                </p>
              </div>

              {/* Section 20 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">20. Assisted Access Application Privacy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We recognise that Assisted Access applications contain Sensitive Personal Information related to individuals' economic circumstances. We treat this information with heightened confidentiality and care.
                </p>
                <h3 className="text-xl text-foreground mb-3">Enhanced Confidentiality Measures</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Assisted Access status is visible only in your private Account dashboard</li>
                  <li>Application information is accessible only to authorised personnel with legitimate need</li>
                  <li>We do not use Assisted Access information for marketing or any purpose other than programme administration</li>
                  <li>Application data is stored with encryption and additional access controls</li>
                  <li>We do not share Assisted Access status with third parties except where required by law</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">No Stigma Policy</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Assisted Access users receive identical Alert Service functionality as paid subscribers. There is no visible difference in service level, features, or treatment. Your participation in the programme is treated with respect and dignity.
                </p>
                <h3 className="text-xl text-foreground mb-3">Limited Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Only designated personnel responsible for programme administration can access Assisted Access application information. We maintain logs of access to this sensitive information and conduct regular audits.
                </p>
              </div>

              {/* Section 21 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">21. Email Communications and CASL Compliance</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We comply with Canada's Anti-Spam Legislation (CASL) in all commercial electronic messages (CEMs) we send. CASL is one of the strictest anti-spam laws in the world, and we take our obligations seriously.
                </p>
                <h3 className="text-xl text-foreground mb-3">Types of Emails We Send</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Alert Notifications (Express Consent Required):</strong> Doctor acceptance notifications sent to Alert Service subscribers based on their specified preferences. You provide express consent when subscribing to the Alert Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Transactional Emails (CASL Exempt):</strong> Account-related messages including registration confirmation, password resets, subscription receipts, cancellation confirmation, and responses to your inquiries. These are exempt from CASL consent requirements as they facilitate requested transactions.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Service Updates (Implied or Express Consent):</strong> Important information about Service changes, policy updates, or security matters affecting your use of the Service.
                </p>
                <h3 className="text-xl text-foreground mb-3">CASL Compliance Features</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All commercial electronic messages include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Clear identification of our organisation (FindYourDoctor.ca)</li>
                  <li>Our contact information</li>
                  <li>A functioning unsubscribe mechanism</li>
                  <li>Clear indication of who is sending the message and on whose behalf</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Unsubscribe Mechanisms</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You can unsubscribe from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Alert notifications:</strong> Cancel your Alert Service subscription through your Account dashboard</li>
                  <li><strong>Service update emails:</strong> Use the unsubscribe link in each email or contact us at support@findyourdoctor.ca</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We will process unsubscribe requests within ten (10) business days as required by CASL. Please note that you may continue to receive essential transactional emails related to your Account even after unsubscribing from marketing communications.
                </p>
                <h3 className="text-xl text-foreground mb-3">No Selling of Email Addresses</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We will never sell, rent, trade, or provide your email address to third parties for their marketing purposes. Your email address is used solely to provide the Service you requested.
                </p>
              </div>

              {/* Section 22 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">22. Accessibility of Privacy Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In accordance with the Accessibility for Ontarians with Disabilities Act, 2005 (AODA), we are committed to ensuring that privacy information is accessible to all individuals, including those with disabilities.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  This Privacy Policy is designed to be readable by screen readers and other assistive technologies. If you require this Privacy Policy in an alternative format (such as large print, audio, or other accessible formats), please contact us at accessibility@findyourdoctor.ca and we will provide it in a timely manner at no cost to you.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We welcome feedback about the accessibility of our privacy information and will work to accommodate accessibility needs to ensure everyone can understand how we handle Personal Information.
                </p>
              </div>

              {/* Section 23 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">23. Provincial Privacy Laws</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  While PIPEDA is the primary federal privacy law governing our practices, we acknowledge that certain provincial privacy laws may apply in specific contexts, particularly where our activities involve provincial government institutions or fall under provincial jurisdiction.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  In Ontario, certain sectors are governed by provincial privacy legislation such as the Personal Health Information Protection Act, 2004 (PHIPA). While FindYourDoctor.ca is not a healthcare provider or "health information custodian" under PHIPA, we recognise the importance of healthcare privacy principles and strive to implement privacy protections that respect the spirit of healthcare privacy laws.
                </p>
              </div>

              {/* Section 24 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">24. Changes to Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Last Updated" date at the top of this Privacy Policy.
                </p>
                <h3 className="text-xl text-foreground mb-3">Notice of Material Changes</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For material changes that significantly affect how we collect, use, or disclose Personal Information, we will provide at least thirty (30) days' advance notice by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Posting a prominent notice on the Service</li>
                  <li>Sending an email to the address associated with your Account (if applicable)</li>
                  <li>Displaying a notification when you log in to your Account</li>
                </ul>
                <h3 className="text-xl text-foreground mb-3">Consent for Significant Changes</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For changes that materially reduce your rights or expand our collection, use, or disclosure of Personal Information in ways not previously disclosed, we will obtain your explicit consent before implementing the changes. You will have the opportunity to accept or decline the changes.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your continued use of the Service after the effective date of an updated Privacy Policy (following appropriate notice) constitutes your acceptance of the changes. If you do not agree to the updated Privacy Policy, you should discontinue use of the Service and may request deletion of your Account.
                </p>
              </div>

              {/* Section 25 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">25. Office of the Privacy Commissioner</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you believe we have violated PIPEDA or mishandled your Personal Information, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada (OPC).
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We encourage you to contact us first so we can address your concerns directly. However, you may file a complaint with the OPC at any time.
                </p>
                <h3 className="text-xl text-foreground mb-3">How to Contact the Privacy Commissioner</h3>
                <div className="bg-background-alt p-6 rounded-lg mb-4">
                  <p className="text-muted-foreground mb-2">
                    <strong>Office of the Privacy Commissioner of Canada</strong>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Phone: 1-800-282-1376 (toll-free in Canada)
                  </p>
                  <p className="text-muted-foreground mb-2">
                    TTY: 1-866-329-5711
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Online: <a href="https://www.priv.gc.ca" className="text-secondary hover:text-primary" target="_blank" rel="noopener noreferrer">www.priv.gc.ca</a>
                  </p>
                  <p className="text-muted-foreground">
                    Mail: 30 Victoria Street, Gatineau, Quebec K1A 1H3
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The OPC investigates complaints, conducts audits, and provides guidance on privacy matters. Complaints to the OPC are confidential and there is no fee for filing a complaint.
                </p>
              </div>

              {/* Section 26 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">26. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact our Privacy Officer:
                </p>
                <div className="bg-background-alt p-6 rounded-lg">
                  <p className="text-muted-foreground mb-2">
                    <strong>Privacy Officer</strong><br />
                    FindYourDoctor.ca
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Email:</strong>{" "}
                    <a href="mailto:privacy@findyourdoctor.ca" className="text-secondary hover:text-primary">
                      privacy@findyourdoctor.ca
                    </a>
                  </p>
                  <p className="text-muted-foreground mb-4">
                    <strong>Response Time:</strong> We will respond to privacy inquiries within thirty (30) days
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>For Other Matters:</strong>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    General Support: <a href="mailto:support@findyourdoctor.ca" className="text-secondary hover:text-primary">support@findyourdoctor.ca</a>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Accessibility: <a href="mailto:accessibility@findyourdoctor.ca" className="text-secondary hover:text-primary">accessibility@findyourdoctor.ca</a>
                  </p>
                  <p className="text-muted-foreground">
                    Legal: <a href="mailto:legal@findyourdoctor.ca" className="text-secondary hover:text-primary">legal@findyourdoctor.ca</a>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
