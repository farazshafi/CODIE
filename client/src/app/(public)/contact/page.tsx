import { Metadata } from 'next'
import ContactForm from './_components/ContactForm'

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Get in touch with the CODIE team — support, billing, bug reports, and general enquiries.',
}

export default function ContactPage() {
    return <ContactForm />
}
