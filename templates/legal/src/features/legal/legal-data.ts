// TODO: Fill in the operator details before launch: the registered company
// name and legal form, country, registered address, company registration
// number and VAT ID (EU e-commerce operator details), and a contact email you
// read. Empty values are hidden on the legal pages.
//
// Bump termsVersion whenever the Terms change materially: acceptance of the
// new version is recorded at each user's next sign-in.
export const legalData = {
  companyName: "__APP_NAME__",
  country: "",
  registeredAddress: "",
  registrationNumber: "",
  vatId: "",
  email: "contact@example.com",
  supervisoryAuthority: {
    // For example, your national data protection authority in the EU.
    name: "",
    url: "",
  },
  termsVersion: "__TODAY__",
  termsLastUpdated: "__TODAY__",
  privacyLastUpdated: "__TODAY__",
  cookieLastUpdated: "__TODAY__",
} as const;
