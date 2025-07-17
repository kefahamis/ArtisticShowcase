import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, Database, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Gallery
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-serif font-bold">Privacy Policy</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: January 1, 2025
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We respect your privacy and are committed to protecting your personal data. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our gallery 
                website and use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                please do not access or use our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Data</h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We may collect personally identifiable information that you provide to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name and contact information (email address, phone number, mailing address)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (billing address, payment method details)</li>
                  <li>Profile information (artist bio, artwork descriptions, profile pictures)</li>
                  <li>Communication preferences and newsletter subscriptions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Usage Data</h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We automatically collect certain information when you use our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage patterns (pages visited, time spent, click patterns)</li>
                  <li>Location data (approximate geographic location based on IP address)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Artwork and Content Data</h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  For artists using our platform:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Artwork images and descriptions</li>
                  <li>Artist statements and biographical information</li>
                  <li>Exhibition history and portfolio data</li>
                  <li>Sales and transaction history</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Service Provision</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Create and manage user accounts</li>
                    <li>Process transactions and payments</li>
                    <li>Display artworks and artist profiles</li>
                    <li>Facilitate communication between artists and buyers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Communication</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Send account notifications and updates</li>
                    <li>Provide customer support</li>
                    <li>Send promotional materials (with your consent)</li>
                    <li>Notify about exhibitions and gallery events</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Platform Improvement</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Analyze usage patterns and user preferences</li>
                    <li>Improve website functionality and user experience</li>
                    <li>Develop new features and services</li>
                    <li>Monitor and prevent fraudulent activity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to outside parties except 
                in the following circumstances:
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Service Providers</h4>
                  <p className="text-gray-700">
                    We may share information with trusted third-party service providers who assist us in 
                    operating our website, processing payments, or providing customer service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Legal Requirements</h4>
                  <p className="text-gray-700">
                    We may disclose information when required by law or to protect our rights, property, 
                    or safety, or that of our users or others.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Business Transfers</h4>
                  <p className="text-gray-700">
                    In the event of a merger, acquisition, or sale of assets, your information may be 
                    transferred as part of the business transaction.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Public Information</h4>
                  <p className="text-gray-700">
                    Artist profiles, artwork descriptions, and exhibition information are publicly displayed 
                    on our platform as part of our gallery services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Security Measures</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure servers and database protection</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication protocols</li>
                    <li>Employee training on data protection</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Data Retention</h4>
                  <p className="text-gray-700">
                    We retain your personal information only for as long as necessary to fulfill the purposes 
                    outlined in this Privacy Policy, unless a longer retention period is required by law.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What Are Cookies</h4>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small data files stored on your device when you visit our website. We use 
                  cookies to enhance your browsing experience and provide personalized services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Types of Cookies We Use</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Managing Cookies</h4>
                <p className="text-gray-700 leading-relaxed">
                  You can control and manage cookies through your browser settings. However, disabling 
                  certain cookies may affect website functionality.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Privacy Rights */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Access and Portability</h4>
                  <p className="text-gray-700">
                    Request a copy of the personal information we hold about you and receive it in a 
                    structured, commonly used format.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Correction and Updates</h4>
                  <p className="text-gray-700">
                    Request correction of inaccurate personal information or ask us to complete 
                    incomplete data.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Deletion</h4>
                  <p className="text-gray-700">
                    Request deletion of your personal information, subject to legal and contractual 
                    obligations.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Restriction and Objection</h4>
                  <p className="text-gray-700">
                    Request restriction of processing or object to certain uses of your personal information.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Withdrawal of Consent</h4>
                  <p className="text-gray-700">
                    Withdraw your consent for data processing activities that require consent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>7. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these external sites or services.
              </p>

              <div>
                <h4 className="font-semibold mb-2">Payment Processors</h4>
                <p className="text-gray-700 leading-relaxed">
                  We use secure third-party payment processors for transactions. Your payment information 
                  is handled according to their privacy policies and security standards.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Social Media Integration</h4>
                <p className="text-gray-700 leading-relaxed">
                  Social media sharing features may collect information about your interactions. Please 
                  review the privacy policies of respective social media platforms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 18 years of age. We do not knowingly 
                collect personal information from children under 18. If we become aware that we have 
                collected personal information from a child under 18, we will delete such information.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your personal information when 
                it is transferred internationally.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of our services after any modifications to the Privacy Policy constitutes 
                your acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                11. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Privacy Officer</strong><br />
                  <strong>Email:</strong> privacy@gallery.com<br />
                  <strong>Phone:</strong> (555) 123-4567<br />
                  <strong>Address:</strong> 123 Gallery Street, Art District, NY 10001
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We will respond to your inquiry within 30 days of receipt.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-gray-500 text-sm">
            This Privacy Policy is effective as of January 1, 2025
          </p>
          <div className="mt-4">
            <Link href="/terms-of-service">
              <Button variant="outline" className="mr-4">
                Terms of Service
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}