export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 10, 2026
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
                <h2 className="text-2xl text-primary mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms of Service (the "Terms") constitute a legally binding agreement between you ("you" or "User") and FindYourDoctor.ca ("we," "us," "our," or the "Service") governing your access to and use of the FindYourDoctor.ca website, services, and applications. By accessing, browsing, or using any part of our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy, incorporated herein by reference.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you do not agree to these Terms in their entirety, you must not access or use our Service. These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You represent and warrant that you have the legal capacity to enter into this agreement. If you are accessing the Service on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">2. About This Service</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca is a community-driven service designed to provide public benefit to residents of Ontario, Canada, who are seeking family doctors accepting new patients. We operate in response to a significant healthcare access crisis affecting approximately 2.5 million Ontarians who currently lack access to primary care physicians.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Service provides a free, searchable directory of family doctors in Ontario, supplemented by community-reported status updates and an optional paid Alert Service for users who wish to receive email notifications when doctors in their area begin accepting new patients. We are committed to maintaining accessibility, transparency, and equity in healthcare information access.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  FindYourDoctor.ca is an independent service and is not affiliated with, endorsed by, or connected to the Ontario Ministry of Health, the College of Physicians and Surgeons of Ontario (CPSO), any Ontario Health Team, Local Health Integration Network (LHIN), or any other government body or healthcare authority.
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">3. Definitions</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For the purposes of these Terms, the following definitions apply:
                </p>
                <ul className="list-none space-y-3 text-muted-foreground">
                  <li><strong>"Service"</strong> means the FindYourDoctor.ca website, platform, applications, and all related services, features, content, and functionality.</li>
                  <li><strong>"User" or "you"</strong> means any individual or entity accessing or using the Service.</li>
                  <li><strong>"Account"</strong> means a registered user account created to access certain features of the Service.</li>
                  <li><strong>"Alert Service"</strong> means the paid subscription service providing email notifications when doctors matching specified criteria begin accepting new patients.</li>
                  <li><strong>"Assisted Access"</strong> means the programme providing free access to the Alert Service for users facing financial barriers, offered for six-month renewable terms.</li>
                  <li><strong>"Community Report"</strong> means user-submitted information regarding a doctor's patient acceptance status.</li>
                  <li><strong>"Content"</strong> means all information, text, graphics, photographs, data, and other materials available through the Service.</li>
                  <li><strong>"Doctor Listing"</strong> means information about a family doctor displayed on the Service, including contact details, location, and acceptance status.</li>
                  <li><strong>"Personal Information"</strong> has the meaning ascribed to it under the Personal Information Protection and Electronic Documents Act (PIPEDA).</li>
                  <li><strong>"Verified Doctor"</strong> means a healthcare provider who has successfully completed our claiming and verification process.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">4. Service Description</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca provides the following features and services:
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Free Doctor Directory Search</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We maintain a searchable directory of family doctors practicing in Ontario, including information about their clinic locations, contact details, languages spoken, accessibility features, age groups served, and current patient acceptance status. This core search functionality is provided free of charge and requires no account registration. No barriers exist to accessing basic directory information.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Community Reporting System</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Users may voluntarily submit status updates regarding doctors' patient acceptance after contacting clinics. This collaborative, volunteer-driven system helps maintain current information for the benefit of the entire community. Community reports are subject to fraud prevention measures including IP address logging.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Doctor Claiming and Verification</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Healthcare providers may claim their listings through an email verification process, enabling them to update their practice information directly and verify their acceptance status. This feature provides transparency and allows providers to maintain accurate information about their practices.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Alert Service Subscription</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  For a monthly fee of $7.99 CAD, users may subscribe to receive email notifications when doctors matching their specified criteria (city, radius, language preferences, accessibility requirements) change their status to "accepting new patients." Subscribers may monitor up to three (3) Ontario cities simultaneously.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Assisted Access Programme</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We offer free access to the Alert Service for individuals facing financial barriers, renewable in six-month terms. This programme demonstrates our commitment to equity and ensuring that cost does not prevent access to healthcare information tools.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Interactive Map Features</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Service includes mapping functionality powered by third-party services, allowing users to visualise doctor locations geographically and search by proximity.
                </p>
                
                <h3 className="text-xl text-foreground mb-3">Educational Resources</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We provide educational articles, guides, and resources related to finding healthcare in Ontario and navigating the healthcare system.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">5. Eligibility and Account Registration</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To use certain features of the Service, including the Alert Service, you must be at least eighteen (18) years of age, being the age of majority in Ontario. By creating an Account, you represent and warrant that you meet this age requirement and that all information you provide is accurate, current, and complete.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When creating an Account, you agree to: (a) provide accurate and complete registration information; (b) maintain and promptly update your Account information; (c) maintain the security and confidentiality of your login credentials; (d) notify us immediately of any unauthorised use of your Account; and (e) accept responsibility for all activities occurring under your Account.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You may not: (a) share your Account with others; (b) use another person's Account without permission; (c) create an Account using false information; or (d) create multiple Accounts to circumvent restrictions or abuse the Service. We reserve the right to refuse Account registration or terminate existing Accounts at our sole discretion.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">6. User Conduct and Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When using our Service, you agree to act in good faith and in accordance with community standards. You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Submit false, misleading, or intentionally inaccurate status updates or Community Reports</li>
                  <li>Use automated tools, bots, scrapers, or similar data-gathering methods to access or extract Content from the Service</li>
                  <li>Attempt to interfere with, disrupt, or compromise the security or integrity of the Service</li>
                  <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations</li>
                  <li>Harass, threaten, impersonate, or intimidate other users, healthcare providers, or our personnel</li>
                  <li>Attempt to gain unauthorised access to any portion of the Service, other users' Accounts, or computer systems or networks</li>
                  <li>Upload or transmit viruses, malware, or any other malicious code</li>
                  <li>Engage in any conduct that restricts or inhibits any other user's enjoyment of the Service</li>
                  <li>Collect or harvest Personal Information of other users without their explicit consent</li>
                  <li>Use the Service to distribute spam or unsolicited communications</li>
                  <li>Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service</li>
                  <li>Remove, circumvent, disable, or otherwise interfere with security-related features of the Service</li>
                  <li>Use the Service in any manner that could damage, disable, overburden, or impair our servers or networks</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Violation of these acceptable use standards may result in immediate termination of your Account and access to the Service, and may subject you to civil and criminal liability under applicable law.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">7. Community Reporting System</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Community Reporting System relies on voluntary contributions from users who have contacted doctors' offices to inquire about patient acceptance. When submitting a Community Report, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>The information you provide is accurate to the best of your knowledge based on direct communication with the healthcare provider's office</li>
                  <li>You are submitting the report in good faith and for the benefit of the community</li>
                  <li>You have not been incentivised or compensated to submit the report</li>
                  <li>You understand that your report will be made available to other users</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We implement fraud prevention measures, including the collection and logging of IP addresses associated with Community Reports, in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA). This information is used solely for security purposes and to prevent abuse of the reporting system.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to moderate, remove, or disregard Community Reports that appear suspicious, inconsistent, or submitted in bad faith. We do not guarantee the accuracy of Community Reports and users should independently verify information before making healthcare decisions.
                </p>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">8. Doctor Claiming and Verification</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Healthcare providers practicing in Ontario may claim their Doctor Listings by submitting a claim request through our verification process. The claiming process involves email verification to confirm the provider's association with the listed practice.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Upon successful verification, Verified Doctors gain the ability to: (a) update their practice information directly; (b) modify their patient acceptance status; (c) add or update details about languages spoken, accessibility features, and other practice characteristics; and (d) designate their status as "verified by doctor," indicating direct provider confirmation.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Verified Doctors agree to: (a) provide accurate and current information about their practice; (b) update their acceptance status promptly when circumstances change; (c) maintain the confidentiality of their verification credentials; and (d) comply with all applicable professional standards and regulations governing their practice.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We do not verify that claimants are registered with the College of Physicians and Surgeons of Ontario (CPSO) or hold valid licences to practice medicine. Users should independently verify provider credentials through official channels such as the CPSO public register before establishing a patient-provider relationship.
                </p>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">9. Alert Service Subscription Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Alert Service is offered on a subscription basis at a monthly fee of $7.99 CAD (Canadian dollars), subject to applicable taxes. By subscribing to the Alert Service, you authorise us to charge your designated payment method on a recurring monthly basis until you cancel your subscription.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Subscription Features:</strong> Alert Service subscribers may monitor up to three (3) Ontario cities and receive email notifications when doctors matching their specified criteria (location radius, language preferences, accessibility requirements) change their status to "accepting new patients." Subscribers may modify their monitored cities and filter preferences at any time through their Account dashboard.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Billing and Renewal:</strong> Your subscription will automatically renew on a monthly basis unless cancelled prior to the renewal date. You will be charged the then-current subscription rate at each renewal. We will provide at least thirty (30) days' advance notice of any price increases, in compliance with Ontario consumer protection regulations.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Alert Delivery:</strong> We will make commercially reasonable efforts to deliver alert emails promptly when status changes occur. However, we do not guarantee the timing, frequency, or delivery of alerts, which depend on doctor status changes, email service reliability, and user email settings. Alert delivery is subject to various factors outside our control.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Service Modifications:</strong> We reserve the right to modify Alert Service features, including the number of monitored cities, available filters, or alert frequency, provided that such modifications do not materially diminish the core value of the service without appropriate notice and, where required by law, the option to cancel without penalty.
                </p>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">10. Assisted Access Programme Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Assisted Access Programme provides free access to the Alert Service for individuals facing financial barriers. Applications are based on self-assessment, and we do not require proof of income, financial documentation, or verification of circumstances. We trust applicants to honestly assess their need for assistance.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Eligibility and Application:</strong> To apply for Assisted Access, you must complete our application form indicating that the monthly subscription fee represents a genuine financial barrier for you. Upon submission, applications are approved automatically, and access is granted immediately.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Term and Renewal:</strong> Assisted Access is granted for an initial term of six (6) months. At the conclusion of each term, participants receive an email with instructions to renew their access with a single click if they continue to require assistance. There is no limit to the number of times you may renew Assisted Access.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Privacy and Confidentiality:</strong> All Assisted Access applications are treated with strict confidentiality. Your participation in the programme is not disclosed to any third party and is visible only in your private Account dashboard. We do not use Assisted Access status information for marketing or any purpose other than programme administration.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Voluntary Upgrade:</strong> If your financial situation improves during your Assisted Access term, we respectfully invite you to consider upgrading to a paid Alert Service subscription. Paid subscriptions help sustain our ability to offer Assisted Access to others who need it. However, there is no obligation to upgrade, and such decisions are entirely voluntary.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Programme Features:</strong> Assisted Access participants receive identical Alert Service features as paid subscribers, including the ability to monitor up to three (3) cities, set language and accessibility filters, and receive timely email notifications. No reduced functionality or degraded service level applies to Assisted Access users.
                </p>
              </div>

              {/* Section 11 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">11. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All fees for the Alert Service are stated in Canadian dollars (CAD) and are subject to applicable federal and provincial taxes. Payment processing is handled by Stripe, a third-party payment processor. By providing payment information, you represent and warrant that you have the legal right to use the designated payment method.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Authorised Charges:</strong> You authorise us and our payment processor to charge your designated payment method for all fees associated with your subscription, including recurring monthly charges, unless and until you cancel your subscription.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Failed Payments:</strong> If a payment fails or is declined, we will attempt to contact you and may retry the charge. If payment cannot be successfully processed after reasonable attempts, we reserve the right to suspend or terminate your Alert Service subscription. You remain responsible for any uncollected amounts.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Price Changes:</strong> We reserve the right to change the Alert Service subscription price. Any price increases will be communicated to you at least thirty (30) days in advance of your next billing cycle. Your continued use of the Alert Service after the price change takes effect constitutes acceptance of the new price. You may cancel your subscription before the price increase takes effect to avoid the new rate.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Payment Information Security:</strong> We do not store your complete payment card information on our servers. All payment information is securely processed and stored by our PCI DSS-compliant payment processor in accordance with applicable payment card industry standards.
                </p>
              </div>

              {/* Section 12 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">12. Refund and Cancellation Policy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In accordance with the Ontario Consumer Protection Act, 2002, you have the right to cancel your Alert Service subscription at any time without penalty or cancellation fees.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Cancellation Process:</strong> You may cancel your subscription at any time through your Account dashboard or by contacting our support team at support@findyourdoctor.ca. Cancellation is effective immediately, and you will retain access to the Alert Service until the end of your current billing period. No further charges will be made after cancellation.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Refund Eligibility:</strong> Refunds are available under the following circumstances: (a) for first-time subscribers, within seven (7) days of initial subscription, provided that no doctor alert emails have been received during this period; or (b) in cases of billing errors or unauthorised charges. Once you receive your first doctor alert email, the service has been delivered and refunds are no longer available for that billing period.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>No Partial Refunds:</strong> We do not provide pro-rated refunds for partial billing periods. If you cancel mid-cycle, you will retain access through the end of your paid period but will not receive a refund for unused days.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Requesting a Refund:</strong> To request a refund where eligible, contact support@findyourdoctor.ca with your Account information and reason for the request. Refund requests are typically processed within five (5) to ten (10) business days.
                </p>
              </div>

              {/* Section 13 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">13. Medical and Healthcare Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>NOT A HEALTHCARE PROVIDER:</strong> FindYourDoctor.ca is an informational service only. We are not a healthcare provider, medical professional, or medical advice service. Nothing on our Service constitutes or should be construed as medical advice, diagnosis, treatment, or professional medical opinion. We do not provide clinical services or establish patient-provider relationships.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>NO AFFILIATION:</strong> We are not affiliated with, endorsed by, sponsored by, or connected to the Ontario Ministry of Health, the College of Physicians and Surgeons of Ontario (CPSO), any Local Health Integration Network (LHIN), Ontario Health Team, hospital, clinic, or any other healthcare authority or government agency. References to any healthcare providers, institutions, or government programmes are for informational purposes only and do not imply endorsement or affiliation.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>MEDICAL EMERGENCIES:</strong> If you are experiencing a medical emergency, call 9-1-1 immediately or proceed to your nearest emergency department. Do not use this Service to seek emergency medical assistance. For urgent but non-emergency health concerns, contact Telehealth Ontario at 1-866-797-0000, visit a walk-in clinic, or consult with a healthcare professional.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL CARE:</strong> The Service is designed to help you locate family doctors accepting patients. It is not a substitute for appropriate medical care, professional medical advice, or in-person healthcare consultations. Always seek the advice of qualified healthcare providers with questions regarding your medical conditions or health concerns.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>INDEPENDENT VERIFICATION:</strong> You are solely responsible for verifying the credentials, qualifications, accepting status, and suitability of any healthcare provider you contact through our Service. Check provider registration with the College of Physicians and Surgeons of Ontario before establishing a patient-provider relationship.
                </p>
              </div>

              {/* Section 14 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">14. Information Accuracy and Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The information provided on FindYourDoctor.ca is largely community-sourced, relying on voluntary reports from users and updates from healthcare providers. While we make reasonable efforts to maintain accurate and current information, we cannot guarantee the accuracy, completeness, reliability, or timeliness of any information displayed on the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Community-Sourced Nature:</strong> Doctor acceptance status, contact information, and other details are based on Community Reports and provider updates. This information may become outdated, may contain errors, or may not reflect current circumstances. Doctor acceptance status can change at any time without notice.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>No Guarantees:</strong> We do not warrant or guarantee that: (a) information on the Service is accurate or up-to-date; (b) doctors listed as "accepting patients" are currently accepting; (c) contact information is correct; (d) you will successfully obtain a family doctor through use of the Service; or (e) alert notifications will result in successful patient registration.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>User Responsibility:</strong> It is your sole responsibility to independently verify all information before making healthcare decisions or contacting providers. Always call doctors' offices directly to confirm current acceptance status, requirements, and availability before assuming you can register as a patient.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Third-Party Information:</strong> Some information on the Service may be derived from third-party sources. We are not responsible for the accuracy of third-party information and make no representations regarding such information.
                </p>
              </div>

              {/* Section 15 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">15. Third-Party Services and Data Processors</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our Service integrates with and relies upon various third-party service providers to deliver functionality. Your use of the Service may be subject to the terms, conditions, and privacy policies of these third parties:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li><strong>Stripe:</strong> Payment processing services for Alert Service subscriptions. Stripe's services are governed by Stripe's Terms of Service and Privacy Policy.</li>
                  <li><strong>Google Maps:</strong> Mapping, geocoding, and location services. Use of mapping features is subject to Google's Terms of Service and Privacy Policy.</li>
                  <li><strong>Resend:</strong> Email delivery services for alert notifications and account communications. Email delivery is subject to Resend's terms and policies.</li>
                  <li><strong>reCAPTCHA:</strong> Spam prevention and security services. Use of security features is subject to Google's Terms of Service and Privacy Policy.</li>
                  <li><strong>Supabase:</strong> Data storage, authentication, and backend services infrastructure.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We take reasonable steps to ensure that our third-party service providers maintain adequate data protection and privacy standards consistent with Canadian law. However, we are not responsible for the practices, policies, or actions of third-party service providers.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Certain third-party services may collect information about you directly. We encourage you to review the privacy policies and terms of service of these third parties to understand how they collect, use, and disclose your information.
                </p>
              </div>

              {/* Section 16 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">16. Intellectual Property Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Service and its entire contents, features, and functionality, including but not limited to all information, software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and arrangement, are owned by FindYourDoctor.ca, its licensors, or other providers of such material and are protected by Canadian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Limited Licence:</strong> Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable licence to access and use the Service for your personal, non-commercial use. This licence does not include any right to: (a) resell or make commercial use of the Service or its contents; (b) collect or use doctor information for commercial purposes; (c) make derivative works of the Service or its contents; (d) download or copy Content except as expressly permitted; or (e) use data mining, robots, or similar data gathering tools.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>User-Submitted Content Licence:</strong> When you submit Community Reports or other content to the Service, you grant us a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, sublicensable licence to use, reproduce, distribute, display, and incorporate such content into the Service for the purpose of operating, promoting, and improving the Service. You represent and warrant that you have all necessary rights to grant this licence.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Community Contribution Recognition:</strong> We acknowledge that Community Reports represent valuable contributions to public benefit. While we maintain a licence to use such reports, we recognise the collaborative nature of community-submitted information and the public interest it serves.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Trademarks:</strong> "FindYourDoctor.ca" and our logo are trademarks or service marks owned by us. You may not use these marks without our prior written permission. All other trademarks, service marks, and trade names referenced on the Service are the property of their respective owners.
                </p>
              </div>

              {/* Section 17 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">17. Content Moderation and Community Standards</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right, but do not assume the obligation, to monitor, review, moderate, edit, or remove any user-submitted content, including Community Reports, at our sole discretion for any reason, including but not limited to content that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Violates these Terms or our community standards</li>
                  <li>Is false, misleading, or deliberately inaccurate</li>
                  <li>Is defamatory, harassing, threatening, or abusive</li>
                  <li>Violates third-party rights, including intellectual property rights</li>
                  <li>Contains personal health information or other private information</li>
                  <li>Appears to be spam or is submitted in bad faith</li>
                  <li>Violates applicable laws or regulations</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We employ a combination of automated tools and human review to moderate content. However, we cannot guarantee the immediate removal of all objectionable content and are not responsible for monitoring all user submissions in real-time.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Appeals Process:</strong> If your content has been removed and you believe the removal was in error, you may contact support@findyourdoctor.ca to request a review. We will make reasonable efforts to review appeals, but moderation decisions are made at our sole discretion.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>No Liability:</strong> We are not responsible or liable for any content posted by users, including inaccurate, defamatory, or offensive content. We do not endorse any opinions expressed by users.
                </p>
              </div>

              {/* Section 18 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">18. Privacy and Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. The Privacy Policy describes how we collect, use, disclose, and protect your Personal Information.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We are committed to compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. We collect only the Personal Information necessary to provide and improve the Service, and we do not sell your Personal Information to third parties.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  By using the Service, you consent to the collection, use, and disclosure of your Personal Information as described in our Privacy Policy. You have rights regarding your Personal Information as set forth in the Privacy Policy and under applicable Canadian privacy law.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Please review our Privacy Policy carefully. If you have questions or concerns about our privacy practices, please contact our Privacy Officer at privacy@findyourdoctor.ca.
                </p>
              </div>

              {/* Section 19 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">19. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE ONTARIO AND CANADIAN LAW, FINDYOURDOCTOR.CA, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Your access to, use of, or inability to access or use the Service</li>
                  <li>Any conduct or content of any third party on or through the Service, including healthcare providers</li>
                  <li>Any content obtained from the Service, including Community Reports</li>
                  <li>Unauthorised access, use, or alteration of your transmissions or content</li>
                  <li>Reliance on information provided through the Service</li>
                  <li>Unsuccessful attempts to register with healthcare providers</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR ONE HUNDRED CANADIAN DOLLARS ($100 CAD), WHICHEVER IS GREATER.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  THESE LIMITATIONS APPLY TO THE FULLEST EXTENT PERMITTED BY LAW. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE GREATEST EXTENT PERMITTED BY LAW.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nothing in these Terms excludes or limits our liability for: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; or (c) any liability that cannot be excluded or limited under applicable law, including rights under the Ontario Consumer Protection Act, 2002.
                </p>
              </div>

              {/* Section 20 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">20. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree to defend, indemnify, and hold harmless FindYourDoctor.ca, its officers, directors, employees, agents, affiliates, and service providers from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Your use of and access to the Service</li>
                  <li>Your violation of any provision of these Terms</li>
                  <li>Your violation of any third-party right, including any intellectual property right or privacy right</li>
                  <li>Any content or information you submit to the Service, including Community Reports</li>
                  <li>Any claim that your content caused damage to a third party</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  This indemnification obligation will survive termination of these Terms and your use of the Service. We reserve the right to assume the exclusive defence and control of any matter subject to indemnification by you, in which case you agree to cooperate with our defence of such claim.
                </p>
              </div>

              {/* Section 21 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">21. Warranty Disclaimers</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  WE DO NOT WARRANT THAT: (A) THE SERVICE WILL MEET YOUR REQUIREMENTS; (B) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (C) THE RESULTS OBTAINED FROM USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE; (D) THE QUALITY OF ANY INFORMATION, PRODUCTS, SERVICES, OR OTHER MATERIAL OBTAINED THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS; OR (E) ANY ERRORS IN THE SERVICE WILL BE CORRECTED.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY, COMPLETENESS, OR CURRENTNESS OF INFORMATION PROVIDED THROUGH THE SERVICE, INCLUDING COMMUNITY REPORTS AND DOCTOR LISTINGS. ANY RELIANCE YOU PLACE ON SUCH INFORMATION IS STRICTLY AT YOUR OWN RISK.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  SOME JURISDICTIONS DO NOT ALLOW THE DISCLAIMER OF IMPLIED WARRANTIES. IN SUCH JURISDICTIONS, THE FOREGOING DISCLAIMERS MAY NOT APPLY TO YOU TO THE EXTENT THEY ARE PROHIBITED BY APPLICABLE LAW. YOU MAY HAVE ADDITIONAL RIGHTS UNDER THE ONTARIO CONSUMER PROTECTION ACT, 2002 OR OTHER CONSUMER PROTECTION LEGISLATION THAT CANNOT BE EXCLUDED OR LIMITED.
                </p>
              </div>

              {/* Section 22 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">22. Termination and Suspension</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right to suspend or terminate your Account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Breach of these Terms</li>
                  <li>Violation of applicable laws or regulations</li>
                  <li>Fraudulent, abusive, or otherwise illegal activity</li>
                  <li>Requests by law enforcement or government agencies</li>
                  <li>Discontinuation or material modification of the Service</li>
                  <li>Technical or security issues</li>
                  <li>Extended periods of inactivity</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may terminate your Account at any time by ceasing use of the Service and, if you have an Alert Service subscription, cancelling your subscription through your Account dashboard or by contacting support.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Effects of Termination:</strong> Upon termination of your Account, your right to access and use the Service immediately ceases. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnification obligations, and limitations of liability.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Data Retention Post-Termination:</strong> Following Account termination, we will retain your Personal Information only as necessary to comply with legal obligations, resolve disputes, enforce our agreements, and as described in our Privacy Policy. Community Reports you have submitted may remain on the Service as they provide public benefit to other users.
                </p>
              </div>

              {/* Section 23 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">23. Geographic Scope</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  FindYourDoctor.ca is designed specifically to serve residents of Ontario, Canada, in their search for family doctors. The doctor directory focuses on Ontario-based healthcare providers, and the Alert Service is limited to monitoring doctors in Ontario cities.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  While the Service may be technically accessible from other locations, it is intended for use by individuals seeking healthcare in Ontario. Information provided through the Service relates specifically to the Ontario healthcare context and may not be relevant or applicable in other jurisdictions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  User data is processed and stored in accordance with Canadian privacy law. Where third-party service providers are located outside Canada, we take steps to ensure adequate data protection measures are in place, as described in our Privacy Policy.
                </p>
              </div>

              {/* Section 24 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">24. Accessibility Commitment</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We are committed to ensuring that our Service is accessible to individuals with disabilities and strive to meet the requirements of the Accessibility for Ontarians with Disabilities Act, 2005 (AODA) and its associated standards, including the Integrated Accessibility Standards Regulation.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We work to design and maintain our Service in accordance with the Web Content Accessibility Guidelines (WCAG) 2.0 Level AA standards, recognising that accessibility is an ongoing process requiring continuous improvement.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  If you encounter accessibility barriers while using the Service or require information in an alternative format, please contact us at accessibility@findyourdoctor.ca. We will make reasonable efforts to provide requested accommodations or alternative formats in a timely manner.
                </p>
              </div>

              {/* Section 25 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">25. Email Communications and CASL Compliance</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We comply with Canada's Anti-Spam Legislation (CASL) in all commercial electronic messages we send. By subscribing to the Alert Service or creating an Account, you provide express consent to receive email communications from us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Doctor alert notifications (for Alert Service subscribers)</li>
                  <li>Account-related communications (registration confirmation, password resets, subscription status)</li>
                  <li>Service updates or announcements that directly affect your use of the Service</li>
                  <li>Important legal or policy updates</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All commercial electronic messages include: (a) clear identification of our organisation; (b) our contact information; and (c) an unsubscribe mechanism allowing you to withdraw consent.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Unsubscribing:</strong> For Alert Service notifications, you may unsubscribe by cancelling your subscription through your Account dashboard. For other communications, use the unsubscribe link provided in each email. Please note that even after unsubscribing from marketing communications, we may still send you essential transactional messages related to your Account or subscription.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We will never sell, rent, or share your email address with third parties for their marketing purposes.
                </p>
              </div>

              {/* Section 26 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">26. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We reserve the right to modify, amend, or update these Terms at any time. When we make changes, we will update the "Last Updated" date at the top of these Terms and, for material changes, we will provide at least thirty (30) days' advance notice by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Posting a notice on the Service</li>
                  <li>Sending an email to the address associated with your Account (if applicable)</li>
                  <li>Displaying a prominent notification when you access the Service</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Your continued use of the Service after the effective date of updated Terms constitutes your acceptance of the changes. If you do not agree to the modified Terms, you must discontinue use of the Service and, if you have an Alert Service subscription, cancel your subscription.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For changes that materially reduce your rights or impose new obligations, we will provide notice and, where required by law (including the Ontario Consumer Protection Act, 2002), obtain your explicit consent before the changes take effect.
                </p>
              </div>

              {/* Section 27 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">27. Governing Law and Dispute Resolution</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms and any dispute or claim arising out of or related to these Terms or the Service shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without giving effect to any conflict of law principles.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You agree that any legal action or proceeding arising out of or relating to these Terms or the Service shall be brought exclusively in the courts of competent jurisdiction located in Ontario, and you irrevocably submit to the personal jurisdiction of such courts.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Informal Resolution:</strong> Before initiating any formal legal proceedings, we encourage you to contact us to seek an informal resolution of any dispute. Many concerns can be resolved quickly and amicably through direct communication.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Consumer Rights:</strong> Nothing in these Terms limits your rights under the Ontario Consumer Protection Act, 2002 or other applicable consumer protection legislation. If you have concerns about the Service, you may also contact the Ministry of Public and Business Service Delivery (Consumer Protection Ontario).
                </p>
              </div>

              {/* Section 28 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">28. Severability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If any provision of these Terms is held to be invalid, illegal, or unenforceable under applicable law, such provision shall be deemed modified to the minimum extent necessary to make it valid, legal, and enforceable. If such modification is not possible, the invalid provision shall be severed from these Terms. The validity, legality, and enforceability of the remaining provisions shall not be affected or impaired in any way.
                </p>
              </div>

              {/* Section 29 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">29. Language</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms have been prepared in the English language. In the event that these Terms are translated into any other language, the English version shall prevail. We may provide a French translation of these Terms in the future, but the English version shall remain the authoritative text in case of any discrepancy or conflict.
                </p>
              </div>

              {/* Section 30 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">30. Entire Agreement</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms, together with our Privacy Policy and any other legal notices or policies published by us on the Service, constitute the entire agreement between you and FindYourDoctor.ca concerning the Service and supersede all prior or contemporaneous communications, agreements, and understandings, whether oral or written, between you and FindYourDoctor.ca regarding the Service.
                </p>
              </div>

              {/* Section 31 */}
              <div>
                <h2 className="text-2xl text-primary mb-4">31. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have questions, concerns, or complaints regarding these Terms of Service, please contact us at:
                </p>
                <div className="bg-background-alt p-6 rounded-lg">
                  <p className="text-muted-foreground mb-2">
                    <strong>General Inquiries:</strong>{" "}
                    <a href="mailto:support@findyourdoctor.ca" className="text-secondary hover:text-primary">
                      support@findyourdoctor.ca
                    </a>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Legal Questions:</strong>{" "}
                    <a href="mailto:legal@findyourdoctor.ca" className="text-secondary hover:text-primary">
                      legal@findyourdoctor.ca
                    </a>
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <strong>Accessibility Concerns:</strong>{" "}
                    <a href="mailto:accessibility@findyourdoctor.ca" className="text-secondary hover:text-primary">
                      accessibility@findyourdoctor.ca
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Privacy Matters:</strong>{" "}
                    <a href="mailto:privacy@findyourdoctor.ca" className="text-secondary hover:text-primary">
                      privacy@findyourdoctor.ca
                    </a>
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
