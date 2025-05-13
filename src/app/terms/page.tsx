// src/app/terms/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Terms of Service</h1>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">1. Introduction</h2>
        <p>
          Welcome to [Your Platform Name]. These Terms of Service ("Terms") govern your use of our website and services.
          By accessing or using our service, you agree to be bound by these Terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">2. Account Registration</h2>
        <p>
          To use certain features, you must register for an account. You agree to provide accurate, current and complete information
          and to keep your account information updated.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">3. Use of the Service</h2>
        <p>
          You agree to use the service only for lawful purposes and in accordance with these Terms.
          You must not use the service to upload, transmit, or display any unlawful, offensive, or infringing content.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">4. Payments and Subscriptions</h2>
        <p>
          Payment processing is handled by our third-party provider. By subscribing, you authorize us to charge your payment method
          for the specified subscription fee. All fees are non-refundable unless otherwise stated.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">5. Creator Content and Subscriptions</h2>
        <p>
          Creators may set subscription prices for their content. Subscribers gain access only after successful payment.
          We do not guarantee content availability and may suspend or remove content at any time.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">6. Termination</h2>
        <p>
          We may suspend or terminate your account at our discretion for violation of these Terms or any applicable law.
          You may also terminate your account by contacting support.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, consequential or punitive damages.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">8. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of [Country/State], without regard to conflict of law principles.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">9. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. We will provide notice of significant changes. Continued use constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-4 mb-2">10. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at <a href="mailto:support@yourplatform.com"
          className="text-blue-600 hover:underline">support@yourplatform.com</a>.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-8">
        &copy; {new Date().getFullYear()} [Your Platform Name]. All rights reserved.
      </p>
    </main>
  )
}
