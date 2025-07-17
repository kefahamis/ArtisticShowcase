import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Scale, Shield, Users, FileText } from "lucide-react";

export default function TermsOfService() {
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
                <Scale className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-serif font-bold">Terms of Service</h1>
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
                <FileText className="w-5 h-5 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Welcome to our art gallery platform. These Terms of Service ("Terms") govern your use of our website, 
                services, and any related applications or platforms (collectively, the "Service") operated by our gallery.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any 
                part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                By creating an account, accessing, or using our platform, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 18 years old to use this Service. By using the Service, you represent 
                and warrant that you are 18 years of age or older.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                2. User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Registration</h4>
                <p className="text-gray-700 leading-relaxed">
                  To access certain features, you may be required to create an account. You agree to provide 
                  accurate, current, and complete information during registration and to update such information 
                  to keep it accurate, current, and complete.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for safeguarding the password and for all activities that occur under 
                  your account. You agree to immediately notify us of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Artist Accounts</h4>
                <p className="text-gray-700 leading-relaxed">
                  Artists who register on our platform agree to provide authentic information about their 
                  work and maintain the accuracy of their artist profile and artwork descriptions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Artwork and Content */}
          <Card>
            <CardHeader>
              <CardTitle>3. Artwork and Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Artist Content</h4>
                <p className="text-gray-700 leading-relaxed">
                  Artists retain ownership of their artwork and content. By uploading content to our platform, 
                  artists grant us a non-exclusive license to display, promote, and market their work through 
                  our gallery services.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Content Standards</h4>
                <p className="text-gray-700 leading-relaxed">
                  All content must be original, lawful, and not infringe upon any third-party rights. 
                  We reserve the right to remove any content that violates these standards.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prohibited Content</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Content that is illegal, harmful, or offensive</li>
                  <li>Copyrighted material without proper authorization</li>
                  <li>Content that violates intellectual property rights</li>
                  <li>Misleading or fraudulent artwork descriptions</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Purchases and Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>4. Purchases and Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Purchase Terms</h4>
                <p className="text-gray-700 leading-relaxed">
                  All purchases are subject to our acceptance. We reserve the right to refuse or cancel 
                  orders at our discretion. Prices are subject to change without notice.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Payment Processing</h4>
                <p className="text-gray-700 leading-relaxed">
                  We use secure third-party payment processors. You agree to provide accurate payment 
                  information and authorize us to charge your payment method for purchases.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Returns and Refunds</h4>
                <p className="text-gray-700 leading-relaxed">
                  Return and refund policies vary by artwork and artist. Please review the specific 
                  terms for each purchase before completing your transaction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                5. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by our gallery 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                publicly perform, republish, download, store, or transmit any of the material on our Service 
                without our prior written consent.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle>6. Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>7. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and bar access to the Service immediately, 
                without prior notice or liability, under our sole discretion, for any reason whatsoever 
                and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you wish to terminate your account, you may simply discontinue using the Service 
                or contact us to request account deletion.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle>8. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                The information on this Service is provided on an "as is" basis. To the fullest extent 
                permitted by law, this Company excludes all representations, warranties, conditions and 
                terms whether express or implied, statutory or otherwise.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We do not guarantee the authenticity, condition, or value of artworks listed on our platform. 
                Buyers are encouraged to conduct their own due diligence before making purchases.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                In no event shall our gallery, nor its directors, employees, partners, agents, suppliers, 
                or affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including without limitation, loss of profits, data, use, goodwill, or other 
                intangible losses, resulting from your use of the Service.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days notice prior to any new terms 
                taking effect.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Your continued use of the Service after any such changes constitutes your acceptance of 
                the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@gallery.com<br />
                  <strong>Phone:</strong> (555) 123-4567<br />
                  <strong>Address:</strong> 123 Gallery Street, Art District, NY 10001
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-gray-500 text-sm">
            These Terms of Service are effective as of January 1, 2025
          </p>
          <div className="mt-4">
            <Link href="/privacy-policy">
              <Button variant="outline" className="mr-4">
                Privacy Policy
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